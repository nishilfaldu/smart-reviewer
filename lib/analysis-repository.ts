import {
  createProcessingAnalysisDocument,
  getChangedArticleFields,
  parseAnalysisDocument,
  parseAnalysisDocuments,
} from "@/lib/analysis-document";
import { ensureIndexes, getAnalysesCollection } from "@/lib/mongodb";
import type { Filter } from "mongodb";

// Fire once per process lifetime — the promise is globally cached so
// subsequent imports resolve instantly with no network round trip.
void ensureIndexes();
import type {
  AnalysisDocument,
  ArticleAnalysis,
  NewsArticle,
  PaginatedAnalysisResult,
} from "@/lib/types";
import { serializeAnalysis } from "@/lib/types";

export async function getAnalysisById(
  id: string,
): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  const document = await collection.findOne({ _id: id });
  return document ? parseAnalysisDocument(document) : null;
}

export async function createProcessingAnalysis(input: {
  id: string;
  article: NewsArticle;
}): Promise<AnalysisDocument> {
  const collection = await getAnalysesCollection();
  const document = await collection.findOneAndUpdate(
    { _id: input.id },
    {
      $setOnInsert: createProcessingAnalysisDocument(input),
    },
    { upsert: true, returnDocument: "after" },
  );

  if (!document) {
    throw new Error("Failed to create analysis record");
  }

  return parseAnalysisDocument(document);
}

export async function syncAnalysisArticle(input: {
  analysis: AnalysisDocument;
  article: NewsArticle;
}): Promise<AnalysisDocument | null> {
  const updates = getChangedArticleFields({
    existing: input.analysis,
    article: input.article,
  });

  if (!Object.keys(updates).length) {
    return input.analysis;
  }

  const collection = await getAnalysesCollection();
  const document = await collection.findOneAndUpdate(
    { _id: input.analysis._id },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  return document ? parseAnalysisDocument(document) : null;
}

export async function claimAnalysisForProcessing(input: {
  analysis: AnalysisDocument;
  article: NewsArticle;
  allowDone?: boolean;
}): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  const articleUpdates = getChangedArticleFields({
    existing: input.analysis,
    article: input.article,
  });
  const document = await collection.findOneAndUpdate(
    {
      _id: input.analysis._id,
      status: {
        $in: input.allowDone ? ["pending", "error", "done"] : ["pending", "error"],
      },
    },
    {
      $set: {
        ...articleUpdates,
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

export async function listCompletedAnalyses(input: {
  page: number;
  pageSize: number;
  query?: string;
  sentiment?: ArticleAnalysis["sentiment"];
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<PaginatedAnalysisResult> {
  const page = Math.max(1, Math.floor(input.page));
  const pageSize = Math.max(1, Math.floor(input.pageSize));
  const collection = await getAnalysesCollection();
  const filters: Filter<AnalysisDocument> = {
    status: "done",
  };

  if (input.sentiment) {
    filters.sentiment = input.sentiment;
  }

  if (input.dateFrom || input.dateTo) {
    filters.articlePublishedAt = {};

    if (input.dateFrom) {
      filters.articlePublishedAt.$gte = input.dateFrom;
    }

    if (input.dateTo) {
      filters.articlePublishedAt.$lte = input.dateTo;
    }
  }

  if (input.query?.trim()) {
    const pattern = escapeForRegex(input.query.trim());
    const regex = new RegExp(pattern, "i");

    filters.$or = [
      { title: regex },
      { sourceName: regex },
      { articleDescription: regex },
      { summary: regex },
    ];
  }

  const [documents, totalAnalyses] = await Promise.all([
    collection
      .find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filters),
  ]);
  const analyses = parseAnalysisDocuments(documents).map(serializeAnalysis);
  const totalPages =
    totalAnalyses > 0 ? Math.ceil(totalAnalyses / pageSize) : 0;

  return {
    analyses,
    totalAnalyses,
    page,
    pageSize,
    totalPages,
  };
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
