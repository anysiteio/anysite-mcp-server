import type { SourceDef } from "./types.js";

export function buildInstructions(sources: SourceDef[]): string {
  const sourceLines = sources.map((s) => `- ${s.name}: ${s.categories.map((c) => c.name).join(", ")}`);
  const sourcesList = sourceLines.join("\n");

  return [
    "AnySite MCP: get structured data from any website or online platform — ",
    "profiles, companies, jobs, posts, articles, filings, reviews, and more. ",
    "Built-in sources with ready-to-use endpoints, plus a universal web scraper for any other site.\n\n",
    "TOOLS:\n\n",
    "1. discover(source, category)\n",
    "   Learn what endpoints are available and what params they accept.\n",
    "   ALWAYS call before execute — endpoint names and params are not guessable.\n\n",
    "2. execute(source, category, endpoint, params)\n",
    "   Fetch data from a source. Returns first 10 items + cache_key.\n",
    "   If more data exists, response includes next_offset — use get_page to continue.\n",
    "   Each execute() costs API credits, so never re-fetch data you already have.\n\n",
    "3. get_page(cache_key, offset, limit)\n",
    "   Load more items from a previous execute(). Data stays cached for 7 days.\n",
    "   Use when execute() returned next_offset or when you need items beyond the first page.\n\n",
    "4. query_cache(cache_key, conditions?, sort_by?, aggregate?, group_by?)\n",
    "   Analyze already fetched data without making new API calls.\n",
    "   Filter (field > value, contains), sort, count, sum, avg, group by field.\n",
    "   Use instead of re-executing when you need to slice or summarize existing results.\n\n",
    "5. export_data(cache_key, format)\n",
    "   Save full dataset as a downloadable file (json, csv, jsonl).\n",
    "   Returns a file path. Use when user needs to download or share the data.\n\n",
    "WORKFLOW:\n",
    "1. Scan ALL SOURCES below — source names and categories are self-descriptive\n",
    "2. Call discover(source, category) to get endpoint names, params and hints\n",
    "3. Call execute(source, category, endpoint, params) to fetch data\n",
    "4. Use get_page/query_cache/export_data with the cache_key from execute\n",
    "5. If no source matches — use webparser:parse to scrape any URL directly\n\n",
    `ALL SOURCES:\n${sourcesList}\n`,
    "Go directly to discover(source, category) to get endpoint details.",
  ].join("");
}
