import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config.js";
import { ApiError } from "./types.js";

export class AnysiteClient {
  constructor(private readonly accessToken: string) {}

  async request(
    apiPath: string,
    body: Record<string, unknown> | undefined,
    method: string,
  ): Promise<unknown> {
    const url = `${API_BASE_URL}/api/${apiPath}`;
    const headers: Record<string, string> = {
      "access-token": this.accessToken,
      "Content-Type": "application/json",
      "X-Request-Source": "mcp-local",
    };

    const cleaned = body
      ? Object.fromEntries(Object.entries(body).filter(([, v]) => v !== null && v !== undefined))
      : undefined;

    const deadline = Date.now() + REQUEST_TIMEOUT_MS;

    while (true) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new ApiError({ error: "Request timeout exceeded" });
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), remaining);

      let response: Response;
      try {
        response = await fetch(url, {
          method: method.toUpperCase(),
          headers,
          body: method.toUpperCase() === "GET" ? undefined : JSON.stringify(cleaned ?? {}),
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof Error && err.name === "AbortError") {
          throw new ApiError({ error: "Request timeout exceeded" });
        }
        throw new ApiError({ error: "Upstream service unavailable, please retry" });
      } finally {
        clearTimeout(timer);
      }

      if (response.status === 429) {
        const retryAfter = parseRetryAfter(response.headers);
        if (Date.now() + retryAfter * 1000 > deadline) {
          throw new ApiError({
            error: "Request took too long to complete, please retry",
            status_code: 429,
          });
        }
        await sleep(retryAfter * 1000);
        continue;
      }

      const errorHeader = response.headers.get("x-error");
      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch {
        if (errorHeader) {
          throw new ApiError({ error: errorHeader, status_code: response.status });
        }
        throw new ApiError({ error: "Invalid JSON response", status_code: response.status });
      }

      if (errorHeader) {
        const partialData = Array.isArray(parsed) ? parsed : undefined;
        throw new ApiError({
          error: errorHeader,
          status_code: response.status,
          data: partialData,
        });
      }

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "error" in (parsed as object)) {
        const obj = parsed as Record<string, unknown>;
        throw new ApiError({
          error: String(obj.error),
          status_code: typeof obj.status_code === "number" ? obj.status_code : response.status,
          data: obj.data,
        });
      }

      if (!response.ok) {
        throw new ApiError({
          error: statusMessage(response.status),
          status_code: response.status,
        });
      }

      return parsed;
    }
  }
}

function parseRetryAfter(headers: Headers): number {
  const explicit = headers.get("x-retry-after");
  if (explicit) {
    const n = Number(explicit);
    if (!Number.isNaN(n)) return n;
  }
  return 60;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function statusMessage(status: number): string {
  switch (status) {
    case 401: return "Unauthorized";
    case 403: return "Forbidden";
    case 404: return "Not found";
    case 422: return "Invalid request";
    case 429: return "Request took too long to complete, please retry";
    case 500: return "Server error";
    default: return "Request failed";
  }
}
