import {
  claimAnalysisForProcessing,
  createProcessingAnalysis,
  getAnalysisById,
  syncAnalysisArticle,
} from "@/lib/analysis-repository";
import type { AnalysisDocument, NewsArticle } from "@/lib/types";

export interface EnsureAnalysisResult {
  analysis: AnalysisDocument;
  shouldStartJob: boolean;
  statusCode: 200 | 202;
}

export async function ensureAnalysis(input: {
  id: string;
  article: NewsArticle;
  reanalyze: boolean;
}): Promise<EnsureAnalysisResult> {
  const existing = await getAnalysisById(input.id);

  if (!existing) {
    const analysis = await createProcessingAnalysis({
      id: input.id,
      article: input.article,
    });

    return {
      analysis,
      shouldStartJob: true,
      statusCode: 202,
    };
  }

  const canReanalyzeTerminal =
    input.reanalyze &&
    (existing.status === "done" || existing.status === "error");
  const shouldClaimExisting =
    existing.status === "pending" || canReanalyzeTerminal;

  if (shouldClaimExisting) {
    const claimed = await claimAnalysisForProcessing({
      analysis: existing,
      article: input.article,
      allowDone: existing.status === "done",
    });

    if (claimed) {
      return {
        analysis: claimed,
        shouldStartJob: true,
        statusCode: 202,
      };
    }
  }
  // no job is started, so we can just sync the articles
  const analysis = await syncAnalysisArticle({
    analysis: existing,
    article: input.article,
  });

  return {
    analysis: analysis ?? existing,
    shouldStartJob: false,
    statusCode: 200,
  };
}
