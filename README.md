<div align="center">

<img src="icon.png" alt="Anysite MCP Server Logo" width="200" />

# Anysite MCP Server

**The entire web is your database. Your AI assistant is the query interface.**

A Model Context Protocol server that lets Claude, Cursor, ChatGPT, and any MCP client query structured data from LinkedIn, Instagram, Twitter/X, Reddit, YouTube, SEC EDGAR, Y Combinator, Crunchbase, and any URL on the web — through five universal tools, plus CRM write-back tools.

[![npm version](https://img.shields.io/npm/v/@anysiteio/mcp.svg)](https://www.npmjs.com/package/@anysiteio/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-anysite.io-blue)](https://docs.anysite.io/mcp-server)

</div>

---

## Quick start

Connect directly to the hosted server at `https://mcp.anysite.io/mcp`. It speaks MCP over Streamable HTTP with OAuth 2.0, and works with Claude Desktop, Claude Code, Cursor, Cline, Windsurf, ChatGPT, and any MCP-compliant client.

> **If your client supports HTTP transport, you do not need this npm package.** The package exists as a [stdio bridge](#stdio-bridge-npm-package) for clients that only speak stdio.

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

Point any compliant client at `https://mcp.anysite.io/mcp` and authenticate via OAuth or `?api_key=YOUR_KEY`.

</details>

#### Step 3: Verify

Ask the assistant:

```
What MCP tools do you have from anysite?
```

It should list: `discover`, `execute`, `get_page`, `query_cache`, `export_data` — plus eight `crm_*` tools if the CRM integration is enabled on your account.

#### Step 4: Run a query

```
Use anysite to find 20 CTOs at Series B fintech startups in New York,
then show me the ones with AI or ML in their headline.
```

The assistant runs `discover` on LinkedIn, picks the right search endpoint, calls `execute`, then narrows server-side with `query_cache`.

---

## stdio bridge (npm package)

`@anysiteio/mcp` is a thin local proxy: it runs on stdio and forwards every request to `https://mcp.anysite.io/mcp` over Streamable HTTP with your token. No business logic lives in the package — tools, instructions, caching and exports all come from the server, so new endpoints and tools appear without a package update.

Use it when your client cannot speak HTTP transport: stdio-only IDE plugins, older Cline/Continue builds, custom stdio runners, or environments where outbound HTTP must go through a managed local process.

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

That is the entire configuration. Only `ANYSITE_ACCESS_TOKEN` is required — create one at [app.anysite.io](https://app.anysite.io). The token can also live in `~/.anysite-mcp.env`.

---

## The tools

| Tool | Purpose |
|---|---|
| `discover(source, category)` | List endpoints in a category with their params and LLM hints. Always call before `execute`. |
| `execute(source, category, endpoint, params)` | Fetch data. Returns first 10 items + `cache_key`. |
| `get_page(cache_key, offset, limit)` | Paginate cached items without re-fetching (limit ≤ 50). |
| `query_cache(cache_key, conditions?, sort_by?, aggregate?, group_by?)` | Filter / sort / aggregate cached items server-side. |
| `export_data(cache_key, output_format, list_unpack?)` | Dump the full dataset to `json` / `jsonl` / `csv`. Returns a download URL. |
| `crm_*` (8 tools) | HubSpot-and-friends read/write: connections, schema, upsert contacts/companies, query, undo. Visible only when CRM is enabled for your account. |

Sources surfaced through `discover`: LinkedIn, Instagram, Twitter/X, Reddit, YouTube, SEC EDGAR, Y Combinator, Crunchbase, DuckDuckGo, the universal web parser, plus AI parsers for GitHub, Amazon, Google Maps, G2, BuiltWith, Apify, GLEIF, Newegg and more. New endpoints appear automatically as soon as they ship on the platform.

Data fetched by `execute` is cached server-side for 7 days: one `execute()` call, then unlimited `get_page` / `query_cache` / `export_data` calls without re-paying API credits. Export files live for 24 hours (regenerated on demand while the cache entry is alive).

---

## Usage pattern

```
discover("linkedin", "search")
  → endpoints: ["users", "companies", "posts", ...] with params

execute("linkedin", "search", "users", { keywords: "CTO AI" })
  → { items: [...first 10], total: 50, cache_key: "abc..." , next_offset: 10 }

get_page("abc...", offset=10)            # next page, free
query_cache("abc...", { conditions: [{ field: "location", op: "contains", value: "San Francisco" }] })
export_data("abc...", "csv")             # full dataset as a CSV download URL
```

The agent figures out the parameter names on its own from `discover`.

---

## Migrating from 2.x

v3 is a breaking change: the package no longer reimplements the server locally — it proxies the hosted MCP server. What changes for you:

- **`export_data` returns a download URL** (`https://mcp.anysite.io/exports/…`) instead of a local file path. The `file_path` field is gone; agents that read the exported file from disk must download it instead. The URL is accessible without a token (the file name is unguessable) and lives for 24 hours — do not share the link if the data is sensitive.
- **`export_data` parameter is `output_format`.** The old `format` name is transparently rewritten by the bridge for backward compatibility, but new prompts should use `output_format`.
- **`get_page` caps `limit` at 50** (server-side page size limit).
- **Cache is server-side now** (7-day TTL, survives restarts, shared across your sessions) instead of in-process.
- **CRM tools appear** (8 `crm_*` tools) when the CRM integration is enabled on your account.
- **Env vars `ANYSITE_API_URL` and `ANYSITE_OPENAPI_URL` are removed** — the bridge talks to the MCP server, not the raw API. Use `ANYSITE_MCP_URL` to point at a different MCP server.
- **`bin` aliases `anysite` and `mcp` are removed** — the command is `anysite-mcp`.
- Two LinkedIn endpoints that were reachable in 2.x (`sn_search/users`, `company/employees`) are excluded by server policy.
- Tool results no longer carry a `mimeType` on content items — the server defines the response shape.
- Cancelling a long `tools/call` stops the client-side wait, but the server keeps processing the request (stateless transport cannot deliver the cancellation) — the work is still billed.

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
| `ANYSITE_MCP_URL` | no | `https://mcp.anysite.io/mcp` | Override the remote MCP server URL |

Variables can also live in `./.env` or `~/.anysite-mcp.env` (real environment variables and `./.env` take precedence over `~/.anysite-mcp.env`).

If the remote server is unreachable at startup, the bridge still starts in a degraded mode (empty tool list, descriptive errors on calls), keeps reconnecting in the background, and announces the tool list via `tools/list_changed` once the server is reachable again.

---

## Project layout

```
src/
├── server.ts   stdio entry (CLI bin): env handling, connect with retries, degraded mode
├── proxy.ts    the bridge: remote client, generic request forwarding, tools/list cache,
│               format→output_format shim, error mapping, background list refresh
├── index.ts    Smithery TypeScript runtime adapter
└── config.ts   env-derived constants
```

---

## License

[MIT](LICENSE.md)
