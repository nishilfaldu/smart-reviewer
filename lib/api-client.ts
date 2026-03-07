"use client";

import type { AnalysisRecord, NewsArticle } from "@/lib/types";

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

export interface NewsResponse {
  articles: NewsArticle[];
}

export interface AnalyzeResponse {
  id: string;
  analysis?: AnalysisRecord;
}

export interface AnalysisResponse {
  analysis: AnalysisRecord;
}

export interface ResultsResponse {
  analyses: AnalysisRecord[];
}

export function fetchNews(query: string): Promise<NewsResponse> {
  return readJson<NewsResponse>(`/api/news?q=${encodeURIComponent(query)}`);
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

export function fetchCompletedAnalyses(): Promise<ResultsResponse> {
  return readJson<ResultsResponse>("/api/results");
}
