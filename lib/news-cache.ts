import type { PaginatedNewsResult } from "@/lib/types";

interface CacheEntry {
  result: PaginatedNewsResult;
  expiresAt: number;
}

const TTL_MS = 5 * 60 * 1_000;
const MAX_ENTRIES = 50;

declare global {
  var __smartReviewerNewsCache: Map<string, CacheEntry> | undefined;
}

const cache =
  globalThis.__smartReviewerNewsCache ?? new Map<string, CacheEntry>();
globalThis.__smartReviewerNewsCache = cache;

function normalizeKey(query: string, page: number): string {
  return `${query.trim().toLowerCase()}::${page}`;
}

function evictExpired(): void {
  const now = Date.now();

  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

export function getCachedNews(
  query: string,
  page: number,
): PaginatedNewsResult | null {
  evictExpired();

  const entry = cache.get(normalizeKey(query, page));

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(normalizeKey(query, page));
    return null;
  }

  return entry.result;
}

export function setCachedNews(
  query: string,
  page: number,
  result: PaginatedNewsResult,
): void {
  evictExpired();

  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;

    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }

  cache.set(normalizeKey(query, page), {
    result,
    expiresAt: Date.now() + TTL_MS,
  });
}
