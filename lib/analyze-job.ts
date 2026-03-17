import {
  markAnalysisDone,
  markAnalysisFailed,
} from "@/lib/analysis-repository";
import { analyzeArticle } from "@/lib/ai";
import type { NewsArticle } from "@/lib/types";

// NOTE: A previous implementation used a globalThis Set<string> to track
// in-flight jobs and prevent duplicate concurrent analyses. That approach
// works well for long-lived Node processes but is unreliable on serverless
// runtimes like Vercel where each invocation may run in a different container
// with its own empty global scope. The MongoDB record status is used as the
// single source of truth instead.

// declare global {
//   var __smartReviewerActiveJobs: Set<string> | undefined;
// }
//
// const activeJobs = globalThis.__smartReviewerActiveJobs ?? new Set<string>();
// globalThis.__smartReviewerActiveJobs = activeJobs;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown analysis error";
}

export async function startAnalysisJob(input: {
  id: string;
  article: NewsArticle;
}): Promise<void> {
  try {
    const articleText = input.article.content.trim();
    const articleDescription = input.article.description.trim();
    const sourceName = input.article.source.name.trim();

    if (!articleText) {
      throw new Error("Article content is missing for analysis");
    }

    const analysis = await analyzeArticle({
      title: input.article.title,
      articleDescription,
      articleText: articleText.slice(0, 5_000),
      articleUrl: input.article.url,
      sourceName,
    });

    await markAnalysisDone({
      id: input.id,
      summary: analysis.summary,
      sentiment: analysis.sentiment,
    });
  } catch (error) {
    await markAnalysisFailed(input.id, toErrorMessage(error));
  }
}
