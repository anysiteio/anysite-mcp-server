#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { CONNECT_ATTEMPTS, getMcpUrl, VERSION } from "./config.js";
import { AnysiteProxy, errorMessage, isAuthError } from "./proxy.js";

dotenv.config();
if (process.env.HOME) {
  dotenv.config({ path: `${process.env.HOME}/.anysite-mcp.env` });
}

function log(...args: unknown[]): void {
  console.error(`[${new Date().toISOString()}]`, ...args);
}

process.stdout.on("error", () => process.exit(0));
process.stderr.on("error", () => process.exit(0));

for (const name of ["ANYSITE_API_URL", "ANYSITE_OPENAPI_URL"]) {
  if (process.env[name]) {
    log(
      `Warning: ${name} is set but no longer used. ` +
        "Since v3 this package proxies the remote MCP server; use ANYSITE_MCP_URL to override the server URL.",
    );
  }
}

const tokenFromEnv = process.env.ANYSITE_ACCESS_TOKEN;
if (!tokenFromEnv) {
  console.error("ANYSITE_ACCESS_TOKEN environment variable is required");
  process.exit(1);
}
const token: string = tokenFromEnv;

const DEGRADED_INSTRUCTIONS =
  "Anysite MCP: the remote server was unreachable at startup, so no tools are available yet. " +
  "Connection is retried on every request and in the background; the tool list will be announced " +
  "via tools/list_changed once the server becomes reachable with a valid ANYSITE_ACCESS_TOKEN.";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function warnOnInsecureUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      log(`Warning: ANYSITE_MCP_URL uses ${parsed.protocol}// — your access token will be sent unencrypted`);
    }
  } catch {
    log(`Warning: ANYSITE_MCP_URL is not a valid URL: ${url}`);
  }
}

async function main(): Promise<void> {
  const url = getMcpUrl();
  warnOnInsecureUrl(url);
  const proxy = new AnysiteProxy(token, url, VERSION, log);

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void proxy.close().finally(() => process.exit(0));
    });
  }

  let connected = false;
  for (let attempt = 1; attempt <= CONNECT_ATTEMPTS && !connected; attempt++) {
    try {
      await proxy.connect();
      connected = true;
    } catch (err) {
      log(`Connect to ${url} failed (attempt ${attempt}/${CONNECT_ATTEMPTS}): ${errorMessage(err)}`);
      if (isAuthError(err)) break;
      if (attempt < CONNECT_ATTEMPTS) await sleep(1000 * attempt);
    }
  }

  const server = proxy.buildServer(connected ? {} : { instructions: DEGRADED_INSTRUCTIONS });
  await server.connect(new StdioServerTransport());

  if (connected) {
    log(`AnySite MCP proxy running on stdio, connected to ${url}`);
    try {
      const { count, crm } = await proxy.prefetchTools();
      log(`Remote tools available: ${count} (CRM: ${crm ? "enabled" : "disabled"})`);
    } catch (err) {
      log("Tool prefetch failed:", errorMessage(err));
    }
  } else {
    log(`AnySite MCP proxy running on stdio in degraded mode (${url} unreachable); will retry in background`);
  }
}

main().catch((err) => {
  log("Fatal error:", err);
  process.exit(1);
});
