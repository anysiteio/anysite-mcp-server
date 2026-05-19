#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { Cache } from "./cache.js";
import { AnysiteClient } from "./client.js";
import { buildInstructions } from "./instructions.js";
import { loadRegistry } from "./loader.js";
import { Registry } from "./registry.js";
import {
  handleDiscover,
  handleExecute,
  handleExportData,
  handleGetPage,
  handleQueryCache,
  type QueryCacheArgs,
} from "./tools.js";
import { buildToolList } from "./tool-schemas.js";

dotenv.config();
if (process.env.HOME) {
  dotenv.config({ path: `${process.env.HOME}/.anysite-mcp.env` });
}

function log(...args: unknown[]): void {
  console.error(`[${new Date().toISOString()}]`, ...args);
}

const token = process.env.ANYSITE_ACCESS_TOKEN;
if (!token) {
  console.error("ANYSITE_ACCESS_TOKEN environment variable is required");
  process.exit(1);
}

const registry = new Registry([]);
const cache = new Cache();
const client = new AnysiteClient(token);
let discoverDescription = "Get endpoint details and params for a source/category pair.";

async function refreshRegistry(): Promise<void> {
  const sources = await loadRegistry();
  registry.replace(sources);
  discoverDescription =
    "Get endpoint details and params for a source/category pair. " +
    "ALWAYS call before execute — endpoint names and params are not guessable.\n\n" +
    buildInstructions(sources);
  const epCount = sources.reduce(
    (acc, s) => acc + s.categories.reduce((a, c) => a + c.endpoints.length, 0),
    0,
  );
  log(`Registry loaded: ${sources.length} sources, ${epCount} endpoints`);
}

const server = new Server(
  { name: "anysite-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: buildToolList(discoverDescription),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  try {
    let result: Record<string, unknown>;
    switch (name) {
      case "discover":
        result = await handleDiscover(registry, String(args.source ?? ""), String(args.category ?? ""));
        break;
      case "execute":
        result = await handleExecute(
          registry,
          cache,
          client,
          String(args.source ?? ""),
          String(args.category ?? ""),
          String(args.endpoint ?? ""),
          (args.params as Record<string, unknown> | undefined) ?? undefined,
        );
        break;
      case "get_page":
        result = await handleGetPage(
          cache,
          String(args.cache_key ?? ""),
          typeof args.offset === "number" ? args.offset : 0,
          typeof args.limit === "number" ? args.limit : 10,
        );
        break;
      case "query_cache":
        result = await handleQueryCache(cache, args as unknown as QueryCacheArgs);
        break;
      case "export_data":
        result = await handleExportData(
          cache,
          String(args.cache_key ?? ""),
          (args.format as "json" | "csv" | "jsonl" | undefined) ?? "json",
          typeof args.list_unpack === "number" ? args.list_unpack : 1,
        );
        break;
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
    return {
      content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    log("Tool error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", mimeType: "text/plain", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  await refreshRegistry();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("AnySite MCP Server running on stdio");
}

main().catch((err) => {
  log("Fatal error:", err);
  process.exit(1);
});
