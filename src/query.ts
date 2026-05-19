type Item = Record<string, unknown>;

export type FilterOp = "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "not_contains";
export type AggregateOp = "sum" | "avg" | "min" | "max" | "count" | "uniq";

export interface Condition {
  field: string;
  op: FilterOp;
  value?: unknown;
}

export interface AggregateSpec {
  field: string;
  op: AggregateOp;
}

export interface QueryArgs {
  conditions?: Condition[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  aggregate?: AggregateSpec;
  groupBy?: string;
  limit?: number;
  offset?: number;
}

const ALLOWED_OPS: ReadonlySet<FilterOp> = new Set([
  "=", "!=", ">", "<", ">=", "<=", "contains", "not_contains",
]);
const ALLOWED_AGG: ReadonlySet<AggregateOp> = new Set([
  "sum", "avg", "min", "max", "count", "uniq",
]);
const SAFE_FIELD = /^[a-zA-Z0-9_.@-]+$/;

function validateField(field: string): void {
  if (!SAFE_FIELD.test(field)) {
    throw new Error(`Invalid field name: ${field}`);
  }
}

function getNested(item: Item, field: string): unknown {
  const parts = field.split(".");
  let cur: unknown = item;
  for (const p of parts) {
    if (cur && typeof cur === "object" && !Array.isArray(cur)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function matchesCondition(item: Item, c: Condition): boolean {
  validateField(c.field);
  if (!ALLOWED_OPS.has(c.op)) throw new Error(`Invalid filter op: ${c.op}`);
  const v = getNested(item, c.field);
  switch (c.op) {
    case "=": return v === c.value;
    case "!=": return v !== c.value;
    case ">": return compare(v, c.value) > 0;
    case "<": return compare(v, c.value) < 0;
    case ">=": return compare(v, c.value) >= 0;
    case "<=": return compare(v, c.value) <= 0;
    case "contains": return String(v ?? "").includes(String(c.value ?? ""));
    case "not_contains": return !String(v ?? "").includes(String(c.value ?? ""));
  }
}

function aggregateValues(values: unknown[], op: AggregateOp): number | string {
  if (op === "count") return values.length;
  if (op === "uniq") return new Set(values.map((v) => JSON.stringify(v))).size;
  const nums = values.filter((v): v is number => typeof v === "number");
  if (nums.length === 0) return 0;
  switch (op) {
    case "sum": return nums.reduce((a, b) => a + b, 0);
    case "avg": return nums.reduce((a, b) => a + b, 0) / nums.length;
    case "min": return Math.min(...nums);
    case "max": return Math.max(...nums);
  }
}

export interface QueryResult {
  items?: Item[];
  total: number;
  aggregate?: Record<string, unknown> | Record<string, unknown>[];
}

export function runQuery(items: Item[], args: QueryArgs): QueryResult {
  const conditions = args.conditions ?? [];
  for (const c of conditions) {
    validateField(c.field);
    if (!ALLOWED_OPS.has(c.op)) throw new Error(`Invalid filter op: ${c.op}`);
  }
  if (args.aggregate) {
    validateField(args.aggregate.field);
    if (!ALLOWED_AGG.has(args.aggregate.op)) {
      throw new Error(`Invalid aggregate op: ${args.aggregate.op}`);
    }
  }
  if (args.groupBy) validateField(args.groupBy);
  if (args.sortBy) validateField(args.sortBy);

  let filtered = conditions.length > 0
    ? items.filter((it) => conditions.every((c) => matchesCondition(it, c)))
    : items.slice();

  if (args.aggregate) {
    const { field, op } = args.aggregate;
    if (args.groupBy) {
      const buckets = new Map<string, unknown[]>();
      for (const it of filtered) {
        const key = String(getNested(it, args.groupBy) ?? "");
        const arr = buckets.get(key) ?? [];
        arr.push(getNested(it, field));
        buckets.set(key, arr);
      }
      const groups: Record<string, unknown>[] = [];
      for (const [key, values] of buckets) {
        groups.push({ [args.groupBy]: key, value: aggregateValues(values, op) });
      }
      return { aggregate: groups, total: groups.length };
    }
    const values = filtered.map((it) => getNested(it, field));
    return { aggregate: { value: aggregateValues(values, op) }, total: 1 };
  }

  if (args.sortBy) {
    const dir = args.sortOrder === "desc" ? -1 : 1;
    const sortBy = args.sortBy;
    filtered.sort((a, b) => dir * compare(getNested(a, sortBy), getNested(b, sortBy)));
  }

  const offset = args.offset ?? 0;
  const limit = args.limit ?? 10;
  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);
  return { items: page, total };
}
