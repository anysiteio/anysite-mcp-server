import { z } from "zod";
import { getMcpUrl, VERSION } from "./config.js";
import { AnysiteProxy } from "./proxy.js";

export const configSchema = z.object({
  ANYSITE_ACCESS_TOKEN: z.string().describe("AnySite API access token"),
});

// Instructions for the hosted (Smithery) entrypoint, where the server object must be
// returned synchronously — before the remote's real instructions are available. Kept to a
// short summary; the stdio entrypoint (server.ts) delivers the remote's full instructions.
const STATIC_INSTRUCTIONS =
  "Anysite MCP: get structured data from any website or online platform — professional profiles & " +
  "companies, jobs, social posts, e-commerce, real estate, crypto, financial markets, academic papers, " +
  "government registries, reviews, maps, news and more, plus a universal web scraper. " +
  "Start with discover(source, category) to see available endpoints and params.";

export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  if (!config?.ANYSITE_ACCESS_TOKEN) {
    throw new Error("ANYSITE_ACCESS_TOKEN is required");
  }

  const proxy = new AnysiteProxy(config.ANYSITE_ACCESS_TOKEN, getMcpUrl(), VERSION, (...args) =>
    console.error(...args),
  );
  void proxy.connect().catch(() => {});
  return proxy.buildServer({ instructions: STATIC_INSTRUCTIONS });
}
