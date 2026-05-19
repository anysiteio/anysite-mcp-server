import { DEFAULT_PAGE_SIZE } from "./config.js";
import { Cache } from "./cache.js";
import { AnysiteClient } from "./client.js";
import { exportItems } from "./export.js";
import { runQuery, type AggregateOp, type Condition, type FilterOp } from "./query.js";
import { Registry } from "./registry.js";
import { ApiError, type CategoryDef, type EndpointDef } from "./types.js";

type Item = Record<string, unknown>;
type Result = Record<string, unknown>;

function extractItems(data: unknown): Item[] {
  if (Array.isArray(data)) return data as Item[];
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if ("error" in rec) return [];
    for (const v of Object.values(rec)) {
      if (Array.isArray(v)) return v as Item[];
    }
  }
  return [];
}

function buildEndpointInfo(ep: EndpointDef): Result {
  const info: Result = {
    name: ep.name,
    description: ep.description,
    params: ep.paramsSchema,
  };
  if (ep.responseFields.length > 0) info.response_fields = ep.responseFields;
  if (ep.llmHint) info.llm_hint = ep.llmHint;
  if (ep.llmRequires.length > 0) info.requires = ep.llmRequires;
  if (Object.keys(ep.llmInputMapping).length > 0) info.input_mapping = ep.llmInputMapping;
  if (Object.keys(ep.llmErrors).length > 0) info.errors = ep.llmErrors;
  return info;
}

function buildCategoryHeader(cat: CategoryDef): Result {
  const out: Result = {};
  if (cat.llmOverview) out.overview = cat.llmOverview;
  if (cat.llmCommonFlows.length > 0) out.common_flows = cat.llmCommonFlows;
  if (Object.keys(cat.llmGlossary).length > 0) out.glossary = cat.llmGlossary;
  return out;
}

export async function handleDiscover(
  registry: Registry,
  source: string,
  category: string,
): Promise<Result> {
  const src = registry.getSource(source);
  if (!src) {
    return {
      error: `Source '${source}' not found`,
      available_sources: registry.sources.map((s) => s.name),
    };
  }
  const cat = registry.getCategory(source, category);
  if (!cat) {
    return {
      error: `Category '${category}' not found in source '${source}'`,
      available_categories: src.categories.map((c) => c.name),
    };
  }
  return {
    source,
    category,
    ...buildCategoryHeader(cat),
    endpoints: cat.endpoints.map(buildEndpointInfo),
  };
}

export async function handleExecute(
  registry: Registry,
  cache: Cache,
  client: AnysiteClient,
  source: string,
  category: string,
  endpoint: string,
  params: Record<string, unknown> | undefined,
): Promise<Result> {
  const src = registry.getSource(source);
  if (!src) {
    return {
      error: `Source '${source}' not found`,
      available_sources: registry.sources.map((s) => s.name),
    };
  }
  const cat = registry.getCategory(source, category);
  if (!cat) {
    return {
      error: `Category '${category}' not found in source '${source}'`,
      available_categories: src.categories.map((c) => c.name),
    };
  }
  const ep = registry.getEndpoint(source, category, endpoint);
  if (!ep) {
    return {
      error: `Endpoint '${endpoint}' not found in ${source}/${category}`,
      available_endpoints: cat.endpoints.map((e) => e.name),
    };
  }

  let raw: unknown;
  try {
    raw = await client.request(ep.apiPath, params, ep.apiMethod);
  } catch (err) {
    if (err instanceof ApiError) {
      const errorInfo: Result = { error: err.message, status_code: err.status };
      if (ep.llmErrors && err.status !== undefined) {
        const hint = ep.llmErrors[String(err.status)];
        if (hint) errorInfo.llm_hint = hint;
      }
      const items = extractItems(err.data);
      if (items.length > 0) {
        const cacheKey = cache.put(items);
        errorInfo.items = items.slice(0, DEFAULT_PAGE_SIZE);
        errorInfo.total = items.length;
        errorInfo.cache_key = cacheKey;
        if (items.length > DEFAULT_PAGE_SIZE) {
          errorInfo.next_offset = DEFAULT_PAGE_SIZE;
          errorInfo.hint = `Use get_page(cache_key='${cacheKey}', offset=${DEFAULT_PAGE_SIZE}) for more`;
        }
      }
      return errorInfo;
    }
    throw err;
  }

  const items = extractItems(raw);
  const requestedRaw = params?.count;
  const requested = typeof requestedRaw === "number" ? requestedRaw : undefined;

  if (items.length === 0) {
    const empty: Result =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? { ...(raw as Result) }
        : { results: raw };
    if (requested !== undefined) empty.requested = requested;
    return empty;
  }

  const cacheKey = cache.put(items);

  if (items.length <= DEFAULT_PAGE_SIZE) {
    const resp: Result = { items, total: items.length, cache_key: cacheKey };
    if (requested !== undefined && items.length < requested) {
      resp.requested = requested;
      resp.note = `Returned ${items.length} of ${requested} requested. Source may have fewer results.`;
    }
    return resp;
  }

  const resp: Result = {
    items: items.slice(0, DEFAULT_PAGE_SIZE),
    total: items.length,
    cache_key: cacheKey,
    next_offset: DEFAULT_PAGE_SIZE,
    hint: `Use get_page(cache_key='${cacheKey}', offset=${DEFAULT_PAGE_SIZE}) for more`,
  };
  if (requested !== undefined && items.length < requested) {
    resp.requested = requested;
    resp.note = `Returned ${items.length} of ${requested} requested. Source may have fewer results.`;
  }
  return resp;
}

export async function handleGetPage(
  cache: Cache,
  cacheKey: string,
  offset = 0,
  limit = 10,
): Promise<Result> {
  const items = cache.get(cacheKey);
  if (!items) {
    return { error: "No data found for this cache_key. It may have expired — re-run execute()." };
  }
  const page = items.slice(offset, offset + limit);
  const resp: Result = {
    items: page,
    total: items.length,
    offset,
    limit,
    cache_key: cacheKey,
  };
  if (offset + limit < items.length) {
    resp.next_offset = offset + limit;
  }
  return resp;
}

export interface QueryCacheArgs {
  cache_key: string;
  conditions?: Condition[];
  sort_by?: string;
  sort_order?: "asc" | "desc";
  aggregate?: { field: string; op: AggregateOp };
  group_by?: string;
  limit?: number;
  offset?: number;
}

export async function handleQueryCache(cache: Cache, args: QueryCacheArgs): Promise<Result> {
  const items = cache.get(args.cache_key);
  if (!items) {
    return { error: "No data found for this cache_key. It may have expired — re-run execute()." };
  }
  try {
    const result = runQuery(items, {
      conditions: args.conditions,
      sortBy: args.sort_by,
      sortOrder: args.sort_order,
      aggregate: args.aggregate,
      groupBy: args.group_by,
      limit: args.limit,
      offset: args.offset,
    });
    return { ...(result as unknown as Result), cache_key: args.cache_key };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function handleExportData(
  cache: Cache,
  cacheKey: string,
  format: "json" | "csv" | "jsonl",
  listUnpack = 1,
): Promise<Result> {
  if (!["json", "csv", "jsonl"].includes(format)) {
    return { error: `Unsupported format '${format}'. Use: json, csv, jsonl` };
  }
  const items = cache.get(cacheKey);
  if (!items || items.length === 0) {
    return { error: "No data found for this cache_key" };
  }
  const result = await exportItems(items, format, listUnpack);
  return {
    file_url: result.fileUrl,
    file_path: result.filePath,
    total: result.total,
    size_bytes: result.sizeBytes,
    format: result.format,
    preview: result.preview,
  };
}

// Re-export FilterOp for tool schema authors that need it
export type { FilterOp };
