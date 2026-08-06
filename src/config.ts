export const VERSION = "3.0.0";

export const DEFAULT_MCP_URL = "https://mcp.anysite.io/mcp";

export function getMcpUrl(): string {
  return process.env.ANYSITE_MCP_URL ?? DEFAULT_MCP_URL;
}

export const CONNECT_TIMEOUT_MS = 10_000;
export const REQUEST_TIMEOUT_MS = 600_000;
export const TOOLS_CACHE_TTL_MS = 60_000;
// Test-only override; read from the real process environment only (evaluated before dotenv).
export const TOOLS_POLL_INTERVAL_MS = Number(process.env.ANYSITE_POLL_INTERVAL_MS ?? "") || 60_000;
export const CONNECT_ATTEMPTS = 2;
