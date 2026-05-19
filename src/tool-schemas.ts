import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const discoverInputZod = z.object({
  source: z.string().describe("Source name, e.g. 'linkedin', 'twitter', 'webparser'"),
  category: z.string().describe("Category within the source, e.g. 'user', 'search'"),
});

export const executeInputZod = z.object({
  source: z.string(),
  category: z.string(),
  endpoint: z.string(),
  params: z.record(z.unknown()).optional(),
});

export const getPageInputZod = z.object({
  cache_key: z.string(),
  offset: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().optional(),
});

export const queryCacheInputZod = z.object({
  cache_key: z.string(),
  conditions: z
    .array(
      z.object({
        field: z.string(),
        op: z.enum(["=", "!=", ">", "<", ">=", "<=", "contains", "not_contains"]),
        value: z.unknown(),
      }),
    )
    .optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
  aggregate: z
    .object({
      field: z.string(),
      op: z.enum(["sum", "avg", "min", "max", "count", "uniq"]),
    })
    .optional(),
  group_by: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const exportDataInputZod = z.object({
  cache_key: z.string(),
  format: z.enum(["json", "csv", "jsonl"]).optional(),
  list_unpack: z.number().int().nonnegative().optional(),
});

export function buildToolList(discoverDescription: string): Tool[] {
  return [
    {
      name: "discover",
      description: discoverDescription,
      inputSchema: {
        type: "object",
        properties: {
          source: { type: "string", description: "Source name, e.g. 'linkedin', 'twitter'" },
          category: { type: "string", description: "Category within the source" },
        },
        required: ["source", "category"],
      },
    },
    {
      name: "execute",
      description:
        "Fetch data from a source. Returns first 10 items + cache_key. Always call discover(source, category) first.",
      inputSchema: {
        type: "object",
        properties: {
          source: { type: "string" },
          category: { type: "string" },
          endpoint: { type: "string" },
          params: { type: "object", additionalProperties: true },
        },
        required: ["source", "category", "endpoint"],
      },
    },
    {
      name: "get_page",
      description: "Load more items from a previous execute() using the cache_key. Data cached for 7 days.",
      inputSchema: {
        type: "object",
        properties: {
          cache_key: { type: "string" },
          offset: { type: "integer", minimum: 0 },
          limit: { type: "integer", minimum: 1 },
        },
        required: ["cache_key"],
      },
    },
    {
      name: "query_cache",
      description:
        "Analyze fetched data without new API calls. Filter, sort, aggregate, group_by. Use cache_key from execute().",
      inputSchema: {
        type: "object",
        properties: {
          cache_key: { type: "string" },
          conditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                op: {
                  type: "string",
                  enum: ["=", "!=", ">", "<", ">=", "<=", "contains", "not_contains"],
                },
                value: {},
              },
              required: ["field", "op"],
            },
          },
          sort_by: { type: "string" },
          sort_order: { type: "string", enum: ["asc", "desc"] },
          aggregate: {
            type: "object",
            properties: {
              field: { type: "string" },
              op: { type: "string", enum: ["sum", "avg", "min", "max", "count", "uniq"] },
            },
            required: ["field", "op"],
          },
          group_by: { type: "string" },
          limit: { type: "integer", minimum: 1 },
          offset: { type: "integer", minimum: 0 },
        },
        required: ["cache_key"],
      },
    },
    {
      name: "export_data",
      description: "Save full dataset as a downloadable file (json, csv, jsonl). Returns local file URL/path.",
      inputSchema: {
        type: "object",
        properties: {
          cache_key: { type: "string" },
          format: { type: "string", enum: ["json", "csv", "jsonl"] },
          list_unpack: { type: "integer", minimum: 0 },
        },
        required: ["cache_key"],
      },
    },
  ];
}
