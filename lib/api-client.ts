"use client";

import type {
  AnalysisRecord,
  NewsArticle,
  PaginatedAnalysisResult,
  PaginatedNewsResult,
  ReviewFilters,
} from "@/lib/types";

interface JsonError {
  error?: string;
}

function toUtcBoundaryIso(value: string, endOfDay: boolean): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const localDate = new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );

  if (
    Number.isNaN(localDate.getTime()) ||
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return null;
  }

  return localDate.toISOString();
}

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as JsonError | null;
    throw new Error(payload?.error ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface AnalyzeResponse {
  id: string;
  analysis?: AnalysisRecord;
}

export interface AnalysisResponse {
  analysis: AnalysisRecord;
}

export function fetchNews(
  query: string,
  page: number,
): Promise<PaginatedNewsResult> {
  return readJson<PaginatedNewsResult>(
    `/api/news?q=${encodeURIComponent(query)}&page=${page}`,
  );
}

export function analyzeNewsArticle(input: {
  article: NewsArticle;
  reanalyze?: boolean;
}): Promise<AnalyzeResponse> {
  return readJson<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function fetchAnalysis(id: string): Promise<AnalysisResponse> {
  return readJson<AnalysisResponse>(`/api/result/${id}`);
}

export function fetchCompletedAnalyses(input: {
  page: number;
  filters: ReviewFilters;
}): Promise<PaginatedAnalysisResult> {
  const searchParams = new URLSearchParams({
    page: String(input.page),
  });

  if (input.filters.query.trim()) {
    searchParams.set("q", input.filters.query.trim());
  }

  if (input.filters.sentiment) {
    searchParams.set("sentiment", input.filters.sentiment);
  }

  if (input.filters.dateFrom) {
    const publishedFrom = toUtcBoundaryIso(input.filters.dateFrom, false);

    if (publishedFrom) {
      searchParams.set("publishedFrom", publishedFrom);
    }
  }

  if (input.filters.dateTo) {
    const publishedTo = toUtcBoundaryIso(input.filters.dateTo, true);

    if (publishedTo) {
      searchParams.set("publishedTo", publishedTo);
    }
  }

  return readJson<PaginatedAnalysisResult>(
    `/api/results?${searchParams.toString()}`,
  );
}
