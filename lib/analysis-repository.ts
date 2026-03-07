import {
  createPendingAnalysisDocument,
  flattenArticleFields,
  parseAnalysisDocument,
  parseAnalysisDocuments,
} from "@/lib/analysis-document";
import { getAnalysesCollection } from "@/lib/mongodb";
import type {
  AnalysisDocument,
  AnalysisRecord,
  ArticleAnalysis,
  NewsArticle,
} from "@/lib/types";
import { serializeAnalysis } from "@/lib/types";

export async function getAnalysisById(
  id: string,
): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  const document = await collection.findOne({ _id: id });
  return document ? parseAnalysisDocument(document) : null;
}

export async function createPendingAnalysis(input: {
  id: string;
  article: NewsArticle;
}): Promise<AnalysisDocument> {
  const collection = await getAnalysesCollection();
  const document = createPendingAnalysisDocument(input);

  await collection.updateOne(
    { _id: input.id },
    {
      $setOnInsert: document,
    },
    { upsert: true },
  );

  const stored = await collection.findOne({ _id: input.id });

  if (!stored) {
    throw new Error("Failed to create analysis record");
  }

  return parseAnalysisDocument(stored);
}

export async function syncAnalysisArticle(input: {
  id: string;
  article: NewsArticle;
}): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  const document = await collection.findOneAndUpdate(
    { _id: input.id },
    {
      $set: {
        ...flattenArticleFields(input.article),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  return document ? parseAnalysisDocument(document) : null;
}

export async function markAnalysisProcessing(
  id: string,
): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  const document = await collection.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        status: "processing",
        updatedAt: new Date(),
        errorMessage: null,
      },
    },
    { returnDocument: "after" },
  );

  return document ? parseAnalysisDocument(document) : null;
}

export async function markAnalysisDone(input: {
  id: string;
  summary: string;
  sentiment: ArticleAnalysis["sentiment"];
}): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  const document = await collection.findOneAndUpdate(
    { _id: input.id },
    {
      $set: {
        summary: input.summary,
        sentiment: input.sentiment,
        status: "done",
        updatedAt: new Date(),
        errorMessage: null,
      },
    },
    { returnDocument: "after" },
  );

  return document ? parseAnalysisDocument(document) : null;
}

export async function markAnalysisFailed(
  id: string,
  errorMessage: string,
): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  const document = await collection.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        status: "error",
        updatedAt: new Date(),
        errorMessage,
      },
    },
    { returnDocument: "after" },
  );

  return document ? parseAnalysisDocument(document) : null;
}

export async function listCompletedAnalyses(): Promise<AnalysisRecord[]> {
  const collection = await getAnalysesCollection();
  const documents = await collection
    .find({ status: "done" })
    .sort({ createdAt: -1 })
    .toArray();

  return parseAnalysisDocuments(documents).map(serializeAnalysis);
}
