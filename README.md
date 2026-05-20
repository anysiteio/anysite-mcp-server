<div align="center">

<img src="icon.png" alt="Anysite MCP Server Logo" width="200" />

# Anysite MCP Server

**The entire web is your database. Your AI assistant is the query interface.**

A Model Context Protocol server that lets Claude, Cursor, ChatGPT, and any MCP client query structured data from LinkedIn, Instagram, Twitter/X, Reddit, YouTube, SEC EDGAR, Y Combinator, Crunchbase, and any URL on the web — through five universal tools.

[![npm version](https://img.shields.io/npm/v/@anysiteio/mcp.svg)](https://www.npmjs.com/package/@anysiteio/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-anysite.io-blue)](https://docs.anysite.io/mcp-server)

</div>

---

## Quick start

Two ways to connect. **Remote MCP** is the recommended path for everyday use — managed cache, OAuth, no infrastructure. **Self-hosted** is for development or when you want the server running locally over stdio.

### Option 1: Remote MCP with OAuth (recommended)

Hosted at `https://mcp.anysite.io/mcp`. Works with Claude Desktop, Claude Code, Cursor, Cline, Windsurf, ChatGPT, and any MCP-compliant client.

#### Step 1: Sign up

Create an account at [anysite.io](https://anysite.io). The `MCP30` promo covers your first month of MCP Unlimited ($30/month, 6 req/min fair-use, no credit counting). Credit-based plans (Starter $49 / Growth $200 / Scale $300 / Pro $549 / Enterprise from $1,199) also include MCP access; see [docs.anysite.io/mcp-server/overview](https://docs.anysite.io/mcp-server/overview).

#### Step 2: Connect your client

<details open>
<summary><b>Claude Desktop</b> — OAuth</summary>

1. Settings → Connectors → Add Custom Connector
2. URL: `https://mcp.anysite.io/mcp`
3. Click Connect, authorize in the browser
4. **Required:** Settings → Capabilities → Tool access → **Tools already loaded**

The last step is critical. Claude Desktop's "Load tools when needed" mode uses name-based matching that fails on generic names like `discover` and `execute`. If you skip it, the tools exist but the model will not reliably call them.

</details>

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http anysite "https://mcp.anysite.io/mcp?api_key=YOUR_KEY"
claude mcp list   # should show: anysite connected
```

The URL carries your API key — treat it as a secret.

</details>

<details>
<summary><b>Cursor</b></summary>

Edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` in the project root:

```json
{
  "mcpServers": {
    "anysite": {
      "url": "https://mcp.anysite.io/mcp?api_key=YOUR_KEY",
      "transport": "http"
    }
  }
}
```

</details>

<details>
<summary><b>Cline, Windsurf, ChatGPT, any MCP client</b></summary>

Anysite implements MCP 1.0 over Streamable HTTP with OAuth 2.0. Point any compliant client at `https://mcp.anysite.io/mcp` and authenticate via OAuth or `?api_key=YOUR_KEY`.

</details>

#### Step 3: Verify

Ask the assistant:

```
What MCP tools do you have from anysite?
```

It should list exactly: `discover`, `execute`, `get_page`, `query_cache`, `export_data`.

#### Step 4: Run a query

```
Use anysite to find 20 CTOs at Series B fintech startups in New York,
then show me the ones with AI or ML in their headline.
```

The assistant runs `discover` on LinkedIn, picks the right search endpoint, calls `execute`, then narrows server-side with `query_cache`.

---

### Option 2: Self-hosted (npm, stdio)

For local development, custom integrations, or when you want the server in-process. Distributed as `@anysiteio/mcp` on npm. Runs over stdio; cache lives in-process for 7 days.

#### Install

```bash
npm install -g @anysiteio/mcp
```

Or run on demand with `npx -y @anysiteio/mcp`.

#### Configure your client

```json
{
  "mcpServers": {
    "anysite": {
      "command": "npx",
      "args": ["-y", "@anysiteio/mcp"],
      "env": {
        "ANYSITE_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

That is the entire configuration. Only `ANYSITE_ACCESS_TOKEN` is required — create one at [app.anysite.io](https://app.anysite.io).

---

## What's new in 2.0

The server no longer ships 60+ individual tools. Instead, it exposes **five universal meta-tools** and discovers the underlying endpoints dynamically from the AnySite OpenAPI spec. This means:

- Every new endpoint added to the AnySite API is available the next time the server starts — no package update required.
- The agent learns the surface through `discover(source, category)` rather than from a static tool catalog.
- Pagination, filtering and exports are handled in-process via the cache: one `execute()` call, then unlimited `get_page` / `query_cache` / `export_data` calls without re-paying API credits.

### The five tools

| Tool | Purpose |
|---|---|
| `discover(source, category)` | List endpoints in a category with their params and LLM hints. Always call before `execute`. |
| `execute(source, category, endpoint, params)` | Fetch data. Returns first 10 items + `cache_key`. |
| `get_page(cache_key, offset, limit)` | Paginate cached items without re-fetching. |
| `query_cache(cache_key, conditions?, sort_by?, aggregate?, group_by?)` | Filter / sort / aggregate cached items locally. |
| `export_data(cache_key, format)` | Dump the full dataset to `json` / `jsonl` / `csv`. Returns a local file path. |

Sources surfaced through `discover`: LinkedIn, Instagram, Twitter/X, Reddit, YouTube, SEC EDGAR, Y Combinator, Crunchbase, DuckDuckGo, the universal web parser, plus AI parsers for GitHub, Amazon, Google Maps, G2, BuiltWith, Apify, GLEIF, Newegg and more. New endpoints appear automatically as soon as they ship on the platform — no package update required.

---

## Usage pattern

```
discover("linkedin", "search")
  → endpoints: ["users", "companies", "posts", ...] with params

execute("linkedin", "search", "users", { keywords: "CTO AI" })
  → { items: [...first 10], total: 50, cache_key: "abc..." , next_offset: 10 }

get_page("abc...", offset=10)            # next page, free
query_cache("abc...", { conditions: [{ field: "location", op: "contains", value: "San Francisco" }] })
export_data("abc...", "csv")             # dump everything to a CSV file
```

### Example: find decision makers and export to CSV

```
1. discover("linkedin", "search")
2. execute("linkedin", "search", "users", { keywords: "CTO", company_keywords: "AI" })
3. query_cache(cache_key, { conditions: [{ field: "location", op: "contains", value: "Berlin" }] })
4. export_data(cache_key, "csv")
```

The agent figures out the parameter names on its own from `discover`.

---

## Skills — ready-made workflows

The MCP server gives raw access. **Anysite Skills** package that access into named workflows you summon by topic, so the assistant runs a proven pattern instead of improvising. Built for Claude Code (also works in Cursor / Windsurf via the same plugin format).

| Workflow | What you say | What it does |
|---|---|---|
| **Lead generation** | "Find me 50 marketing directors at Series A SaaS in Berlin and enrich with email" | LinkedIn search → enrichment → CSV |
| **Competitor intelligence** | "Track @competitor across LinkedIn hires, social, YC, and recent posts" | Multi-source intel + hiring velocity + sentiment |
| **Person analyzer** | "Deep-dive on this LinkedIn profile before our partnership call" | LinkedIn + Twitter + Reddit + GitHub + web → strategic brief |
| **Market research** | "Map the AI legal-tech landscape — startups, funding, momentum" | YC + Crunchbase + SEC + Reddit + Twitter sentiment |
| **Customer pain mining** | "Pull verbatim complaints about Salesforce from Reddit and Twitter" | Pain clusters + exact quotes + white-space gaps |
| **Brand reputation** | "What is the conversation around our brand this week?" | Cross-platform mention scan with sentiment scoring |
| **Positioning map** | "Plot 3-5 competitors on a positioning map, find the empty quadrant" | Five-axis comparison + positioning statement |

Full catalog (17 skills, including VC analyst, influencer discovery, audience analysis, content analytics, trend analysis): [github.com/anysiteio/agent-skills](https://github.com/anysiteio/agent-skills).

### Install

In Claude Code:

```bash
/plugin marketplace add https://github.com/anysiteio/agent-skills
/plugin install anysite-lead-generation@anysite-skills
```

You can install one skill or the whole marketplace. The MCP server connection above is the only prerequisite.

---

## Local development

```bash
git clone https://github.com/anysiteio/anysite-mcp.git
cd anysite-mcp
npm install
npm run build:tsc
ANYSITE_ACCESS_TOKEN=... node build/server.js
```

Inspect the tools interactively:

```bash
npm run inspector
```

---

## Configuration

| Env var | Required | Default | Notes |
|---|---|---|---|
| `ANYSITE_ACCESS_TOKEN` | yes | — | Create one at [app.anysite.io](https://app.anysite.io) |
| `ANYSITE_API_URL` | no | `https://api.anysite.io` | Override the API base |
| `ANYSITE_OPENAPI_URL` | no | `https://api.anysite.io/openapi.json` | Override the spec URL |

---

## Project layout

```
src/
├── server.ts          stdio entry (CLI bin)
├── index.ts           Smithery TypeScript runtime adapter
├── loader.ts          fetches and parses the OpenAPI spec
├── registry.ts        in-memory source/category/endpoint registry
├── client.ts          HTTP client with retry/timeout
├── cache.ts           cache_key → items
├── query.ts           in-memory filter / sort / aggregate
├── export.ts          json / jsonl / csv writers
├── tools.ts           the five meta-tool handlers
├── tool-schemas.ts    MCP tool input schemas (zod + JSON Schema)
├── instructions.ts    instructions text for the LLM
├── config.ts          env-derived constants
└── types.ts           shared types
```

---

## License

[MIT](LICENSE.md)
