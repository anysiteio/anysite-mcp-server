export const API_BASE_URL = process.env.ANYSITE_API_URL ?? "https://api.anysite.io";
export const OPENAPI_SPEC_URL =
  process.env.ANYSITE_OPENAPI_URL ?? `${API_BASE_URL}/openapi.json`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CACHE_MAX_ENTRIES = 256;
export const REQUEST_TIMEOUT_MS = 600_000;

export const EXCLUDED_PATH_PATTERNS: RegExp[] = [
  /^\/api\/linkedin\/management\//,
  /^\/token\//,
];

export const EXCLUDED_PARAMS = new Set(["timeout"]);
export const EXCLUDED_RESPONSE_FIELDS = new Set(["@type"]);
