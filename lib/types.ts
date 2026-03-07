import type { z } from "zod";

import {
  analysisDocumentSchema,
  analysisStatusSchema,
  articleAnalysisSchema,
  newsArticleSchema,
  newsSourceSchema,
  sentimentSchema,
} from "@/lib/schemas";

export type Sentiment = z.infer<typeof sentimentSchema>;

export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;

export type NewsSource = z.infer<typeof newsSourceSchema>;

export type NewsArticle = z.infer<typeof newsArticleSchema>;

export type AnalysisDocument = z.infer<typeof analysisDocumentSchema>;

export interface AnalysisRecord {
  id: string;
  articleUrl: string;
  title: string;
  article: NewsArticle;
  summary: string | null;
  sentiment: Sentiment | null;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string | null;
}

export type ArticleAnalysis = z.infer<typeof articleAnalysisSchema>;

function normalizeArticle(document: AnalysisDocument): NewsArticle {
  return {
    id: document.articleId ?? document._id,
    title: document.title,
    description: document.articleDescription ?? "",
    content: document.articleContent ?? "",
    url: document.articleUrl,
    image: document.articleImage ?? null,
    publishedAt:
      document.articlePublishedAt?.toISOString() ??
      document.createdAt.toISOString(),
    lang: document.articleLanguage ?? "en",
    source: {
      id: document.sourceId ?? "",
      name: document.sourceName ?? "Unknown source",
      url: document.sourceUrl ?? document.articleUrl,
      country: document.sourceCountry ?? "",
    },
  };
}

export function serializeAnalysis(document: AnalysisDocument): AnalysisRecord {
  return {
    id: document._id,
    articleUrl: document.articleUrl,
    title: document.title,
    article: normalizeArticle(document),
    summary: document.summary,
    sentiment: document.sentiment,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    errorMessage: document.errorMessage ?? null,
  };
}
