import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Cache } from "./cache.js";
import { AnysiteClient } from "./client.js";
import { buildInstructions } from "./instructions.js";
import { loadRegistry } from "./loader.js";
import { Registry } from "./registry.js";
import {
  discoverInputZod,
  executeInputZod,
  exportDataInputZod,
  getPageInputZod,
  queryCacheInputZod,
} from "./tool-schemas.js";
import {
  handleDiscover,
  handleExecute,
  handleExportData,
  handleGetPage,
  handleQueryCache,
} from "./tools.js";

export const configSchema = z.object({
  ANYSITE_ACCESS_TOKEN: z.string().describe("AnySite API access token"),
});

export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  if (!config?.ANYSITE_ACCESS_TOKEN) {
    throw new Error("ANYSITE_ACCESS_TOKEN is required");
  }
  process.env.ANYSITE_ACCESS_TOKEN = config.ANYSITE_ACCESS_TOKEN;

  const cache = new Cache();
  const client = new AnysiteClient(config.ANYSITE_ACCESS_TOKEN);
  const registry = new Registry([]);
  let registryReady: Promise<void> | null = null;

  function ensureRegistry(): Promise<void> {
    if (!registryReady) {
      registryReady = (async () => {
        const sources = await loadRegistry();
        registry.replace(sources);
      })();
    }
    return registryReady;
  }

  const mcp = new McpServer({ name: "anysite-mcp", version: "2.0.0" });

  // Build initial instructions lazily — at first tool call.
  const discoverDescriptionFn = () =>
    "Get endpoint details and params for a source/category pair. " +
    "ALWAYS call before execute — endpoint names and params are not guessable.\n\n" +
    buildInstructions(registry.sources);

  mcp.tool(
    "discover",
    discoverDescriptionFn(),
    discoverInputZod.shape,
    async (args) => {
      await ensureRegistry();
      const result = await handleDiscover(registry, args.source, args.category);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  mcp.tool(
    "execute",
    "Fetch data from a source. Returns first 10 items + cache_key. Always call discover() first.",
    executeInputZod.shape,
    async (args) => {
      await ensureRegistry();
      const result = await handleExecute(
        registry,
        cache,
        client,
        args.source,
        args.category,
        args.endpoint,
        args.params,
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  mcp.tool(
    "get_page",
    "Load more items from a previous execute() using the cache_key. Data cached for 7 days.",
    getPageInputZod.shape,
    async (args) => {
      const result = await handleGetPage(cache, args.cache_key, args.offset ?? 0, args.limit ?? 10);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  mcp.tool(
    "query_cache",
    "Analyze fetched data without new API calls. Filter, sort, aggregate, group_by.",
    queryCacheInputZod.shape,
    async (args) => {
      const result = await handleQueryCache(cache, args);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  mcp.tool(
    "export_data",
    "Save full dataset as a downloadable file (json, csv, jsonl). Returns local file URL/path.",
    exportDataInputZod.shape,
    async (args) => {
      const result = await handleExportData(
        cache,
        args.cache_key,
        args.format ?? "json",
        args.list_unpack ?? 1,
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  return mcp.server;
}
