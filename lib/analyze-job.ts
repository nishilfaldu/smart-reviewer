import {
  getAnalysisById,
  markAnalysisDone,
  markAnalysisFailed,
  markAnalysisProcessing,
} from "@/lib/analysis-repository";
import { analyzeArticle } from "@/lib/ai";
import type { NewsArticle } from "@/lib/types";

declare global {
  var __smartReviewerActiveJobs: Set<string> | undefined;
}

const activeJobs = globalThis.__smartReviewerActiveJobs ?? new Set<string>();
globalThis.__smartReviewerActiveJobs = activeJobs;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown analysis error";
}

export async function startAnalysisJob(input: {
  id: string;
  title: string;
  articleUrl: string;
  article?: NewsArticle;
}): Promise<void> {
  if (activeJobs.has(input.id)) {
    return;
  }

  activeJobs.add(input.id);

  try {
    const existing = await getAnalysisById(input.id);

    if (!existing) {
      throw new Error("Analysis record not found");
    }

    if (existing.status === "done") {
      return;
    }

    await markAnalysisProcessing(input.id);

    const articleText = (
      input.article?.content ??
      existing.articleContent ??
      ""
    ).trim();

    if (!articleText) {
      throw new Error("Article content is missing for analysis");
    }

    const analysis = await analyzeArticle({
      title: input.title,
      articleText: articleText.slice(0, 5_000),
      articleUrl: input.articleUrl,
    });

    await markAnalysisDone({
      id: input.id,
      summary: analysis.summary,
      sentiment: analysis.sentiment,
    });
  } catch (error) {
    await markAnalysisFailed(input.id, toErrorMessage(error));
  } finally {
    activeJobs.delete(input.id);
  }
}
