import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

type Item = Record<string, unknown>;

export interface ExportResult {
  fileUrl: string;
  filePath: string;
  total: number;
  sizeBytes: number;
  format: string;
  preview: string[];
}

function flatten(obj: Item, parentKey = "", maxDepth = 2, listUnpack = 1): Item {
  const flat: Item = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = parentKey ? `${parentKey}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v) && maxDepth > 0) {
      Object.assign(flat, flatten(v as Item, key, maxDepth - 1, listUnpack));
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        flat[key] = "";
      } else if (typeof v[0] === "object" && v[0] !== null) {
        if (listUnpack === 0) {
          flat[key] = JSON.stringify(v);
        } else {
          for (let i = 0; i < Math.min(listUnpack, v.length); i++) {
            Object.assign(flat, flatten(v[i] as Item, `${key}.${i}`, maxDepth - 1, listUnpack));
          }
          if (v.length > listUnpack) {
            flat[`${key}._rest`] = JSON.stringify(v.slice(listUnpack));
          }
          flat[`${key}._total`] = v.length;
        }
      } else {
        flat[key] = v.map((x) => String(x)).join(" | ");
      }
    } else {
      flat[key] = v;
    }
  }
  return flat;
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "string" ? value : JSON.stringify(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportItems(
  items: Item[],
  fmt: "json" | "csv" | "jsonl",
  listUnpack = 1,
): Promise<ExportResult> {
  const dir = join(tmpdir(), "anysite-mcp-exports");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${fmt}`;
  const filePath = join(dir, filename);

  let content: string;
  let preview: string[];

  if (fmt === "json") {
    content = JSON.stringify(items, null, 2);
    preview = items.slice(0, 3).map((x) => JSON.stringify(x));
  } else if (fmt === "jsonl") {
    const lines = items.map((x) => JSON.stringify(x));
    content = lines.join("\n");
    preview = lines.slice(0, 3);
  } else {
    const flat = items.map((it) => flatten(it, "", 2, listUnpack));
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const row of flat) {
      for (const k of Object.keys(row)) {
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      }
    }
    const header = keys.map(csvEscape).join(",");
    const rows = flat.map((row) => keys.map((k) => csvEscape(row[k])).join(","));
    content = [header, ...rows].join("\n");
    preview = [header, ...rows.slice(0, 2)];
  }

  await writeFile(filePath, content, "utf8");

  return {
    fileUrl: pathToFileURL(filePath).toString(),
    filePath,
    total: items.length,
    sizeBytes: Buffer.byteLength(content, "utf8"),
    format: fmt,
    preview,
  };
}
