import {
  EXCLUDED_PARAMS,
  EXCLUDED_PATH_PATTERNS,
  EXCLUDED_RESPONSE_FIELDS,
  OPENAPI_SPEC_URL,
} from "./config.js";
import type { CategoryDef, EndpointDef, SourceDef } from "./types.js";

type AnyRecord = Record<string, unknown>;

function asRecord(v: unknown): AnyRecord | undefined {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as AnyRecord) : undefined;
}

function resolveRefs(obj: unknown, schemas: AnyRecord, seen = new Set<string>()): unknown {
  if (Array.isArray(obj)) return obj.map((x) => resolveRefs(x, schemas, seen));
  const rec = asRecord(obj);
  if (!rec) return obj;
  const ref = typeof rec["$ref"] === "string" ? (rec["$ref"] as string) : undefined;
  if (ref) {
    const name = ref.split("/").pop() ?? "";
    if (seen.has(name)) return { $ref: name, _circular: true };
    const next = new Set(seen);
    next.add(name);
    const resolved = asRecord(schemas[name]) ?? {};
    const merged: AnyRecord = {};
    for (const [k, v] of Object.entries(resolved)) {
      if (k !== "title") merged[k] = v;
    }
    for (const [k, v] of Object.entries(rec)) {
      if (k !== "$ref") merged[k] = v;
    }
    return resolveRefs(merged, schemas, next);
  }
  const out: AnyRecord = {};
  for (const [k, v] of Object.entries(rec)) out[k] = resolveRefs(v, schemas, seen);
  return out;
}

function extractParamsSchema(operation: AnyRecord, schemas: AnyRecord): AnyRecord {
  const body = asRecord(operation.requestBody) ?? {};
  const content = asRecord(asRecord(body.content)?.["application/json"]) ?? {};
  let schema = asRecord(content.schema) ?? {};

  const ref = typeof schema["$ref"] === "string" ? (schema["$ref"] as string) : undefined;
  if (ref) {
    const name = ref.split("/").pop() ?? "";
    schema = asRecord(schemas[name]) ?? {};
  }

  const properties = asRecord(schema.properties) ?? {};
  const required = Array.isArray(schema.required) ? (schema.required as string[]) : [];

  const filteredProperties: AnyRecord = {};
  for (const [k, v] of Object.entries(properties)) {
    if (EXCLUDED_PARAMS.has(k)) continue;
    filteredProperties[k] = resolveRefs(v, schemas);
  }
  const filteredRequired = required.filter((r) => !EXCLUDED_PARAMS.has(r));

  const result: AnyRecord = { type: "object", properties: filteredProperties };
  if (filteredRequired.length > 0) result.required = filteredRequired;
  return result;
}

function extractResponseInfo(operation: AnyRecord, schemas: AnyRecord): [string, string[]] {
  const responses = asRecord(operation.responses) ?? {};
  const ok = asRecord(responses["200"]) ?? {};
  const content = asRecord(asRecord(ok.content)?.["application/json"]) ?? {};
  const schema = asRecord(content.schema) ?? {};
  const itemsSchema =
    schema.type === "array" ? asRecord((schema as AnyRecord).items) ?? {} : schema;

  const ref = typeof itemsSchema["$ref"] === "string" ? (itemsSchema["$ref"] as string) : "";
  if (!ref) return ["", []];

  const name = ref.split("/").pop() ?? "";
  const resolved = asRecord(schemas[name]) ?? {};
  const properties = asRecord(resolved.properties) ?? {};

  const fields: string[] = [];
  for (const [fieldName, def] of Object.entries(properties)) {
    if (EXCLUDED_RESPONSE_FIELDS.has(fieldName)) continue;
    const defRec = asRecord(def) ?? {};
    let suffix = "";
    if (defRec.type === "array") {
      suffix = "[]";
    } else if (Array.isArray(defRec.anyOf)) {
      for (const variant of defRec.anyOf) {
        if (asRecord(variant)?.type === "array") {
          suffix = "[]";
          break;
        }
      }
    }
    fields.push(`${fieldName}${suffix}`);
  }
  return [name, fields];
}

function parsePath(path: string): { source: string; category: string; endpointName: string; apiPath: string } | null {
  if (!path.startsWith("/api/")) return null;
  let segments = path.slice("/api/".length).split("/");
  if (segments[0] === "ai_based") segments = segments.slice(1);
  if (segments.length === 0) return null;

  const source = segments[0];
  const remaining = segments.slice(1);
  const category = remaining.length > 0 ? remaining[0] : "general";
  const endpointName = remaining.length > 0 ? remaining.join("_") : source;
  const apiPath = path.slice("/api/".length);
  return { source, category, endpointName, apiPath };
}

function pathExcluded(path: string): boolean {
  return EXCLUDED_PATH_PATTERNS.some((re) => re.test(path));
}

function buildCategoryDescription(endpoints: EndpointDef[]): string {
  const parts = endpoints.map((ep) => ep.name.replace(/_/g, " "));
  const joined = parts.join(", ");
  return joined.length > 0 ? joined.charAt(0).toUpperCase() + joined.slice(1) : "";
}

function buildSourceDescription(categories: CategoryDef[]): string {
  return categories.map((c) => `${c.name} (${c.description})`).join("; ");
}

export function loadRegistryFromSpec(spec: AnyRecord): SourceDef[] {
  const schemas = asRecord(asRecord(spec.components)?.schemas) ?? {};
  const paths = asRecord(spec.paths) ?? {};

  const tagLookup: Record<string, AnyRecord> = {};
  const tags = Array.isArray(spec.tags) ? (spec.tags as unknown[]) : [];
  for (const t of tags) {
    const tag = asRecord(t);
    if (tag && typeof tag.name === "string") tagLookup[tag.name] = tag;
  }

  const sourcesMap = new Map<string, Map<string, EndpointDef[]>>();
  const categoryTags = new Map<string, string>();

  for (const [path, methods] of Object.entries(paths)) {
    if (pathExcluded(path)) continue;
    const parsed = parsePath(path);
    if (!parsed) continue;

    const methodsRec = asRecord(methods);
    if (!methodsRec) continue;

    for (const [method, operationRaw] of Object.entries(methodsRec)) {
      if (!["get", "post", "put", "delete", "patch"].includes(method)) continue;
      const operation = asRecord(operationRaw);
      if (!operation) continue;

      const paramsSchema = extractParamsSchema(operation, schemas);
      const description =
        (typeof operation.summary === "string" && operation.summary) ||
        (typeof operation.description === "string" && operation.description) ||
        parsed.endpointName;
      const [responseModel, responseFields] = extractResponseInfo(operation, schemas);

      const endpoint: EndpointDef = {
        name: parsed.endpointName,
        description,
        paramsSchema,
        apiPath: parsed.apiPath,
        apiMethod: method.toUpperCase(),
        responseModel,
        responseFields,
        llmHint: typeof operation["x-llm-hint"] === "string" ? (operation["x-llm-hint"] as string) : "",
        llmRequires: Array.isArray(operation["x-llm-requires"]) ? (operation["x-llm-requires"] as string[]) : [],
        llmInputMapping: asRecord(operation["x-llm-input-mapping"]) as Record<string, string> ?? {},
        llmErrors: asRecord(operation["x-llm-errors"]) as Record<string, string> ?? {},
      };

      const bySource = sourcesMap.get(parsed.source) ?? new Map<string, EndpointDef[]>();
      const list = bySource.get(parsed.category) ?? [];
      list.push(endpoint);
      bySource.set(parsed.category, list);
      sourcesMap.set(parsed.source, bySource);

      const opTags = Array.isArray(operation.tags) ? (operation.tags as string[]) : [];
      const key = `${parsed.source}/${parsed.category}`;
      if (opTags.length > 0 && !categoryTags.has(key)) categoryTags.set(key, opTags[0]);
    }
  }

  const result: SourceDef[] = [];
  for (const sourceName of [...sourcesMap.keys()].sort()) {
    const cats = sourcesMap.get(sourceName)!;
    const categoryDefs: CategoryDef[] = [];
    for (const catName of [...cats.keys()].sort()) {
      const endpoints = cats.get(catName)!;
      const tagName = categoryTags.get(`${sourceName}/${catName}`) ?? "";
      const tagData = tagLookup[tagName] ?? {};
      categoryDefs.push({
        name: catName,
        description: buildCategoryDescription(endpoints),
        endpoints,
        llmOverview: typeof tagData["x-llm-overview"] === "string" ? (tagData["x-llm-overview"] as string) : "",
        llmCommonFlows: Array.isArray(tagData["x-llm-common-flows"])
          ? (tagData["x-llm-common-flows"] as string[])
          : [],
        llmGlossary: asRecord(tagData["x-llm-glossary"]) ?? {},
      });
    }

    result.push({
      name: sourceName,
      description: buildSourceDescription(categoryDefs),
      categories: categoryDefs,
    });
  }

  return result;
}

export async function fetchOpenApiSpec(url: string = OPENAPI_SPEC_URL): Promise<AnyRecord> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status}`);
    }
    return (await response.json()) as AnyRecord;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadRegistry(): Promise<SourceDef[]> {
  const spec = await fetchOpenApiSpec();
  return loadRegistryFromSpec(spec);
}
