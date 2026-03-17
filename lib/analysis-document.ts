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

const stringFieldKeys = [
  "articleUrl",
  "title",
  "articleId",
  "articleDescription",
  "articleContent",
  "articleImage",
  "articleLanguage",
  "sourceId",
  "sourceName",
  "sourceUrl",
  "sourceCountry",
] as const satisfies ReadonlyArray<Exclude<keyof FlattenedArticleFields, "articlePublishedAt">>;

function areDatesEqual(left: Date, right: Date): boolean {
  return left.getTime() === right.getTime();
}

function assignIfChanged<Key extends keyof FlattenedArticleFields>(input: {
  updates: Partial<FlattenedArticleFields>;
  existing: AnalysisDocument;
  nextFields: FlattenedArticleFields;
  key: Key;
}): void {
  if (input.existing[input.key] !== input.nextFields[input.key]) {
    input.updates[input.key] = input.nextFields[input.key];
  }
}

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

export function getChangedArticleFields(input: {
  existing: AnalysisDocument;
  article: NewsArticle;
}): Partial<FlattenedArticleFields> {
  const nextFields = flattenArticleFields(input.article);
  const updates: Partial<FlattenedArticleFields> = {};

  for (const key of stringFieldKeys) {
    assignIfChanged({
      updates,
      existing: input.existing,
      nextFields,
      key,
    });
  }

  if (
    !areDatesEqual(
      input.existing.articlePublishedAt,
      nextFields.articlePublishedAt,
    )
  ) {
    updates.articlePublishedAt = nextFields.articlePublishedAt;
  }

  return updates;
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

export function createProcessingAnalysisDocument(input: {
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
    status: "processing",
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
