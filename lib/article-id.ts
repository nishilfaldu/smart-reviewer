import { createHash } from "node:crypto";

export function normalizeArticleUrl(url: string): string {
  return new URL(url).toString();
}

export function createArticleId(url: string): string {
  return createHash("sha256").update(normalizeArticleUrl(url)).digest("hex");
}
