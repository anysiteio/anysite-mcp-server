import { randomUUID } from "node:crypto";
import { CACHE_MAX_ENTRIES, CACHE_TTL_MS } from "./config.js";
import type { CacheEntry } from "./types.js";

export class Cache {
  private entries = new Map<string, CacheEntry>();

  put(items: Record<string, unknown>[]): string {
    this.evictExpired();
    while (this.entries.size >= CACHE_MAX_ENTRIES) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
    const key = randomUUID();
    this.entries.set(key, { items, createdAt: Date.now() });
    return key;
  }

  get(key: string): Record<string, unknown>[] | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.items;
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (now - entry.createdAt > CACHE_TTL_MS) {
        this.entries.delete(key);
      }
    }
  }
}
