import { z } from "zod";

export const sentimentSchema = z.enum(["positive", "neutral", "negative"]);

export const analysisStatusSchema = z.enum([
  "pending",
  "processing",
  "done",
  "error",
]);

export const newsSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  country: z.string().min(1),
});

export const newsArticleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  content: z.string().min(1),
  url: z.string().url(),
  image: z.string().url().nullable(),
  publishedAt: z.string().datetime(),
  lang: z.string().min(1),
  source: newsSourceSchema,
});

export const analyzeBodySchema = z.object({
  article: newsArticleSchema,
});

export const articleAnalysisSchema = z.object({
  summary: z
    .string()
    .min(1, "Summary is required")
    .describe("A concise summary of the article in 3 to 5 sentences."),
  sentiment: sentimentSchema,
});

export const analysisDocumentSchema = z.object({
  _id: z.string().min(1),
  articleUrl: z.string().url(),
  title: z.string().min(1),
  articleId: z.string().min(1).nullable().optional(),
  articleDescription: z.string().nullable().optional(),
  articleContent: z.string().nullable().optional(),
  articleImage: z.string().url().nullable().optional(),
  articlePublishedAt: z.date().nullable().optional(),
  articleLanguage: z.string().min(1).nullable().optional(),
  sourceId: z.string().min(1).nullable().optional(),
  sourceName: z.string().min(1).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  sourceCountry: z.string().min(1).nullable().optional(),
  summary: z.string().nullable(),
  sentiment: sentimentSchema.nullable(),
  status: analysisStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  errorMessage: z.string().nullable().optional(),
});
