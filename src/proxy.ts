import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StreamableHTTPClientTransport,
  StreamableHTTPError,
} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { RequestHandlerExtra, RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ClientRequest,
  JSONRPCRequest,
  ServerCapabilities,
  ServerNotification,
  ServerRequest,
  ServerResult,
} from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode, McpError, ResultSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  CONNECT_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
  TOOLS_CACHE_TTL_MS,
  TOOLS_POLL_INTERVAL_MS,
} from "./config.js";

type Extra = RequestHandlerExtra<ServerRequest, ServerNotification>;
type RawResult = Record<string, unknown>;

const DEGRADED_HASH = "degraded";
const STALE_CACHE_MAX_MS = TOOLS_CACHE_TTL_MS * 60;

// The remote runs stateless (stateless_http=True): its standalone GET SSE stream can never
// deliver anything, but the SDK would keep the connection open and retry it on auth errors.
// Answering GET with a synthetic 405 makes the SDK skip the stream entirely.
const blockGetFetch = (url: string | URL, init?: RequestInit): Promise<Response> => {
  if ((init?.method ?? "GET").toUpperCase() === "GET") {
    return Promise.resolve(new Response(null, { status: 405 }));
  }
  return fetch(url, init);
};

// FastMCP always advertises these regardless of registered items. `logging` is deliberately
// absent: declaring it would make our Server intercept logging/setLevel locally instead of
// forwarding it, and the remote does not advertise logging anyway.
const DEFAULT_CAPABILITIES: ServerCapabilities = {
  tools: { listChanged: true },
  prompts: { listChanged: true },
  resources: { subscribe: false, listChanged: true },
};

// Degraded-mode responses for list methods whose capabilities we advertise: clients probe
// these at startup and should see empty collections, not protocol errors.
const EMPTY_RESULTS: Record<string, RawResult> = {
  "prompts/list": Object.freeze({ prompts: [] }),
  "resources/list": Object.freeze({ resources: [] }),
  "resources/templates/list": Object.freeze({ resourceTemplates: [] }),
};

// The SDK serializes any thrown error using its `code` and `message` properties, so these
// plain Error subclasses reach the client as clean JSON-RPC errors without the nested
// "MCP error N:" prefixes that re-throwing McpError would accumulate at every hop.
class ForwardedError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly data?: unknown,
  ) {
    super(message);
  }
}

class ConnectionFailureError extends Error {
  readonly code = ErrorCode.InternalError;
}

function forwardedFrom(err: McpError): ForwardedError {
  const clean = err.message.replace(/^(MCP error -?\d+: )+/, "");
  return new ForwardedError(err.code, clean, err.data);
}

export function isAuthError(err: unknown): boolean {
  return err instanceof StreamableHTTPError && (err.code === 401 || err.code === 403);
}

export function errorMessage(err: unknown, depth = 0): string {
  if (err instanceof Error) {
    const cause = (err as { cause?: unknown }).cause;
    return cause && depth < 3 ? `${err.message}: ${errorMessage(cause, depth + 1)}` : err.message;
  }
  return String(err);
}

function friendlyConnectionError(err: unknown, url: string): string {
  if (isAuthError(err)) {
    return (
      `Anysite MCP: authentication failed (HTTP ${(err as StreamableHTTPError).code}). ` +
      "Check that ANYSITE_ACCESS_TOKEN is valid — create or copy a token at https://app.anysite.io."
    );
  }
  return (
    `Anysite MCP: cannot reach ${url} (${errorMessage(err)}). ` +
    "Check your network connection; the server may be temporarily unavailable. The request will be retried on the next call."
  );
}

// The server expects `output_format`, but v2 of this package (and older skills/prompts) used
// `format`. TODO: remove once the server accepts `format` as an alias.
function rewriteExportArgs(params: RawResult): RawResult {
  if (params.name !== "export_data") return params;
  const args = params.arguments;
  if (args && typeof args === "object" && !Array.isArray(args)) {
    const rec = args as RawResult;
    if ("format" in rec && !("output_format" in rec)) {
      const { format, ...rest } = rec;
      return { ...params, arguments: { ...rest, output_format: format } };
    }
  }
  return params;
}

export class AnysiteProxy {
  private client: Client | null = null;
  private connecting: Promise<Client> | null = null;
  private server: Server | null = null;
  private toolsCache: { result: RawResult; hash: string; fetchedAt: number } | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly token: string,
    private readonly url: string,
    private readonly version: string,
    private readonly log: (...args: unknown[]) => void = () => {},
  ) {}

  connect(): Promise<Client> {
    return this.ensureClient();
  }

  getInstructions(): string | undefined {
    return this.client?.getInstructions();
  }

  getCapabilities(): ServerCapabilities {
    const caps = this.client?.getServerCapabilities();
    if (!caps) return DEFAULT_CAPABILITIES;
    return { ...caps, tools: { ...caps.tools, listChanged: true } };
  }

  async prefetchTools(): Promise<{ count: number; crm: boolean }> {
    const client = await this.ensureClient();
    const result = await this.rawRequest(client, "tools/list", {}, { timeout: CONNECT_TIMEOUT_MS });
    this.toolsCache = { result, hash: hashTools(result), fetchedAt: Date.now() };
    const tools = (result.tools as { name: string }[] | undefined) ?? [];
    return { count: tools.length, crm: tools.some((t) => t.name.startsWith("crm_")) };
  }

  buildServer(opts: { instructions?: string; capabilities?: ServerCapabilities } = {}): Server {
    const server = new Server(
      { name: "anysite-mcp", version: this.version },
      {
        capabilities: opts.capabilities ?? this.getCapabilities(),
        instructions: opts.instructions ?? this.getInstructions(),
      },
    );
    server.fallbackRequestHandler = (req, extra) => this.handleRequest(req, extra);
    server.onclose = () => {
      void this.close();
    };
    this.server = server;
    this.startPolling();
    return server;
  }

  async close(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    const client = this.client;
    this.client = null;
    if (client) await client.close().catch(() => {});
  }

  private ensureClient(): Promise<Client> {
    if (this.client) return Promise.resolve(this.client);
    if (!this.connecting) {
      this.connecting = this.doConnect().finally(() => {
        this.connecting = null;
      });
    }
    return this.connecting;
  }

  private async doConnect(): Promise<Client> {
    const transport = new StreamableHTTPClientTransport(new URL(this.url), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "X-Client": `anysite-mcp-npm/${this.version}`,
        },
      },
      fetch: blockGetFetch,
    });
    transport.onerror = (err) => this.log("Remote transport error:", errorMessage(err));
    // No authProvider on purpose: on 401 the SDK would start OAuth discovery and dynamic
    // client registration against the server's real /.well-known endpoints, then try to
    // open a browser from a headless stdio process. A static Bearer token is the contract.
    const client = new Client({ name: "anysite-mcp-proxy", version: this.version });
    client.fallbackNotificationHandler = async (notification) => {
      try {
        await this.server?.notification(notification as ServerNotification);
      } catch (err) {
        this.log("Failed to forward notification:", errorMessage(err));
      }
    };
    try {
      await client.connect(transport, { timeout: CONNECT_TIMEOUT_MS });
    } catch (err) {
      await client.close().catch(() => {});
      throw err;
    }
    client.onclose = () => {
      if (this.client === client) this.client = null;
    };
    this.client = client;
    this.log(`Connected to ${this.url}`);
    return client;
  }

  // Deliberately only drops the reference without close(): closing aborts the client's shared
  // AbortController and would kill every other in-flight request on the same client. With the
  // GET SSE blocked there are no persistent connections to leak — the abandoned client object
  // is simply garbage-collected once its in-flight requests settle.
  private resetClient(client: Client): void {
    if (this.client === client) this.client = null;
  }

  private async handleRequest(req: JSONRPCRequest, extra: Extra): Promise<ServerResult> {
    let params = { ...((req.params ?? {}) as RawResult) };
    if (req.method === "tools/list") {
      return (await this.handleToolsList(params, extra)) as ServerResult;
    }
    if (req.method === "tools/call") {
      params = rewriteExportArgs(params);
    }
    return (await this.forward(req.method, params, extra)) as ServerResult;
  }

  private async handleToolsList(params: RawResult, extra: Extra): Promise<RawResult> {
    const paginated = params.cursor !== undefined;
    if (!paginated && this.toolsCache && Date.now() - this.toolsCache.fetchedAt < TOOLS_CACHE_TTL_MS) {
      return this.toolsCache.result;
    }
    try {
      const result = await this.forward("tools/list", params, extra);
      if (!paginated) {
        this.toolsCache = { result, hash: hashTools(result), fetchedAt: Date.now() };
      }
      return result;
    } catch (err) {
      if (!(err instanceof ConnectionFailureError)) throw err;
      // Serving the cached first page to a cursor request would loop the client's pagination
      // (same nextCursor forever) — fail the request instead.
      if (paginated) throw err;
      const cache = this.toolsCache;
      if (cache && cache.hash !== DEGRADED_HASH && Date.now() - cache.fetchedAt < STALE_CACHE_MAX_MS) {
        this.log("tools/list failed, serving cached list:", err.message);
        return cache.result;
      }
      // A protocol error here makes some clients disable the server for the whole session.
      // Serving an empty list with a "degraded" baseline keeps the session alive and lets the
      // background poller announce recovery via notifications/tools/list_changed.
      this.log("tools/list failed, serving empty list:", err.message);
      this.toolsCache = { result: { tools: [] }, hash: DEGRADED_HASH, fetchedAt: 0 };
      return this.toolsCache.result;
    }
  }

  private startPolling(): void {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => {
      void this.refreshTools();
    }, TOOLS_POLL_INTERVAL_MS);
    this.pollTimer.unref?.();
  }

  // The remote is stateless and never emits tools/list_changed itself, but the tool list can
  // still change mid-session: CrmToolGate reveals crm_* tools once billing enables CRM, and a
  // degraded start recovers here — ensureClient() reconnects, the hash comparison against the
  // "degraded" baseline fires the notification.
  private async refreshTools(): Promise<void> {
    try {
      const client = await this.ensureClient();
      const result = await this.rawRequest(client, "tools/list", {}, { timeout: CONNECT_TIMEOUT_MS });
      const hash = hashTools(result);
      const changed = this.toolsCache !== null && this.toolsCache.hash !== hash;
      this.toolsCache = { result, hash, fetchedAt: Date.now() };
      if (changed) {
        this.log("Remote tool list changed, notifying client");
        await this.server?.sendToolListChanged();
      }
    } catch (err) {
      this.log("Background tools/list refresh failed:", errorMessage(err));
    }
  }

  private async forward(method: string, params: RawResult, extra: Extra): Promise<RawResult> {
    const isToolCall = method === "tools/call";
    let client: Client;
    try {
      client = await this.ensureClient();
    } catch (err) {
      return this.connectionFailure(err, method);
    }
    try {
      return await this.rawRequest(client, method, params, this.requestOptions(params, extra));
    } catch (err) {
      if (err instanceof McpError) throw forwardedFrom(err);
      if (extra.signal.aborted) throw err;
      this.log(`Forward ${method} failed:`, errorMessage(err));
      this.resetClient(client);
      // tools/call may have side effects (billed execute, CRM writes): the remote may have
      // executed the tool even though the response was lost, so it is never re-sent.
      if (isToolCall) return this.connectionFailure(err, method);
      try {
        const fresh = await this.ensureClient();
        return await this.rawRequest(fresh, method, params, this.requestOptions(params, extra));
      } catch (retryErr) {
        if (retryErr instanceof McpError) throw forwardedFrom(retryErr);
        return this.connectionFailure(retryErr, method);
      }
    }
  }

  private connectionFailure(err: unknown, method: string): RawResult {
    const text = friendlyConnectionError(err, this.url);
    if (method === "tools/call") {
      return { content: [{ type: "text", text }], isError: true };
    }
    const empty = EMPTY_RESULTS[method];
    if (empty) return empty;
    throw new ConnectionFailureError(text);
  }

  private requestOptions(params: RawResult, extra: Extra): RequestOptions {
    const options: RequestOptions = {
      timeout: REQUEST_TIMEOUT_MS,
      resetTimeoutOnProgress: true,
      signal: extra.signal,
    };
    const meta = params._meta as { progressToken?: string | number } | undefined;
    const progressToken = meta?.progressToken;
    if (progressToken !== undefined) {
      options.onprogress = (progress) => {
        void extra
          .sendNotification({
            method: "notifications/progress",
            params: { progressToken, ...progress },
          })
          .catch(() => {});
      };
    }
    return options;
  }

  private async rawRequest(
    client: Client,
    method: string,
    params: RawResult,
    options: RequestOptions,
  ): Promise<RawResult> {
    const request = { method, params } as ClientRequest;
    return (await client.request(request, ResultSchema, options)) as RawResult;
  }
}

function hashTools(result: RawResult): string {
  return JSON.stringify(result.tools ?? result);
}
