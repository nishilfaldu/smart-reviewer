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
    searchParams.set("dateFrom", input.filters.dateFrom);
  }

  if (input.filters.dateTo) {
    searchParams.set("dateTo", input.filters.dateTo);
  }

  return readJson<PaginatedAnalysisResult>(
    `/api/results?${searchParams.toString()}`,
  );
}
