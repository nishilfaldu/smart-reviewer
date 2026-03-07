import { analysisDocumentSchema } from "@/lib/schemas";
import type { AnalysisDocument, NewsArticle } from "@/lib/types";

type FlattenedArticleFields = Pick<
  AnalysisDocument,
  | "articleUrl"
  | "title"
  | "articleId"
  | "articleDescription"
  | "articleContent"
  | "articleImage"
  | "articlePublishedAt"
  | "articleLanguage"
  | "sourceId"
  | "sourceName"
  | "sourceUrl"
  | "sourceCountry"
>;

export function flattenArticleFields(
  article: NewsArticle,
): FlattenedArticleFields {
  return {
    articleUrl: article.url,
    title: article.title,
    articleId: article.id,
    articleDescription: article.description,
    articleContent: article.content,
    articleImage: article.image,
    articlePublishedAt: new Date(article.publishedAt),
    articleLanguage: article.lang,
    sourceId: article.source.id,
    sourceName: article.source.name,
    sourceUrl: article.source.url,
    sourceCountry: article.source.country,
  };
}

export function createPendingAnalysisDocument(input: {
  id: string;
  article: NewsArticle;
  now?: Date;
}): AnalysisDocument {
  const now = input.now ?? new Date();

  return analysisDocumentSchema.parse({
    _id: input.id,
    ...flattenArticleFields(input.article),
    summary: null,
    sentiment: null,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    errorMessage: null,
  });
}

export function parseAnalysisDocument(document: unknown): AnalysisDocument {
  return analysisDocumentSchema.parse(document);
}

export function parseAnalysisDocuments(documents: unknown[]): AnalysisDocument[] {
  return documents.map(parseAnalysisDocument);
}
