"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  ArticleReviewModal,
  type ArticleReviewMode,
} from "@/components/review-dialog/article-review-modal";
import { analyzeNewsArticle, fetchAnalysis } from "@/lib/api-client";
import {
  getReviewPollingErrorMessage,
  getReviewStartErrorMessage,
} from "@/lib/display";
import type { AnalysisRecord, NewsArticle } from "@/lib/types";

interface ArticleReviewFlowProps {
  article: NewsArticle | null;
  initialAnalysis?: AnalysisRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleReviewFlow({
  article,
  initialAnalysis = null,
  isOpen,
  onClose,
}: ArticleReviewFlowProps) {
  const queryClient = useQueryClient();
  const analyzeMutation = useMutation({
    mutationFn: analyzeNewsArticle,
    onSuccess: (payload) => {
      if (payload.analysis) {
        queryClient.setQueryData(["result", payload.id], {
          analysis: payload.analysis,
        });
      }
    },
  });

  const { data, error, isPending, mutate, reset } = analyzeMutation;
  const jobId = data?.id ?? null;
  const mutationAnalysis = data?.analysis ?? null;
  const canHydrateFromInitialAnalysis =
    initialAnalysis?.articleUrl === article?.url &&
    initialAnalysis?.status === "done";

  useEffect(() => {
    if (!isOpen || !article || canHydrateFromInitialAnalysis) {
      return;
    }

    reset();
    mutate({
      article,
      reanalyze: false,
    });
  }, [article, canHydrateFromInitialAnalysis, isOpen, mutate, reset]);

  const analysisQuery = useQuery({
    queryKey: ["result", jobId],
    queryFn: () => fetchAnalysis(jobId as string),
    enabled:
      Boolean(jobId) &&
      isOpen &&
      !isPending &&
      // if its terminal status, we don't need to poll anymore
      isTerminalStatus(mutationAnalysis) === false,
    refetchInterval: (query) => {
      const status = query.state.data?.analysis.status;
      return status === "done" || status === "error" ? false : 2_000;
    },
  });

  const polledAnalysis = analysisQuery.data?.analysis ?? null;
  const activeAnalysis =
    isPending || !article
      ? null
      : pickActiveAnalysis(
        polledAnalysis,
        mutationAnalysis,
        initialAnalysis,
        article.url,
      );

  const isLoadingReview = isPending && !activeAnalysis && isOpen;
  const hasPollingError =
    Boolean(analysisQuery.error) && !activeAnalysis && !isLoadingReview;

  let mode: ArticleReviewMode = "processing";

  if ((error || hasPollingError) && !activeAnalysis) {
    mode = "error";
  } else if (activeAnalysis?.status === "done") {
    mode = "done";
  } else if (activeAnalysis?.status === "error") {
    mode = "error";
  } else if (!activeAnalysis && isLoadingReview) {
    mode = "opening";
  }

  const analysisForModal: AnalysisRecord | null =
    (error || hasPollingError) && !activeAnalysis
      ? {
        id: article?.url ?? "review-start-error",
        articleUrl: article?.url ?? "",
        title: article?.title ?? "",
        article: article as NewsArticle,
        summary: null,
        sentiment: null,
        status: "error" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        errorMessage: error
          ? getReviewStartErrorMessage()
          : getReviewPollingErrorMessage(),
      }
      : activeAnalysis;

  function handleRetry() {
    if (!article) {
      return;
    }

    if (jobId) {
      queryClient.removeQueries({ queryKey: ["result", jobId], exact: true });
    }

    reset();
    mutate({
      article,
      reanalyze: true,
    });
  }

  function handleRefresh() {
    if (!article) {
      return;
    }

    if (jobId) {
      queryClient.removeQueries({ queryKey: ["result", jobId], exact: true });
    }

    reset();
    mutate({
      article,
      reanalyze: true,
    });
  }

  function handleClose() {
    if (jobId) {
      void queryClient.cancelQueries({ queryKey: ["result", jobId], exact: true });
    }

    reset();
    onClose();
  }

  return (
    <ArticleReviewModal
      article={article}
      analysis={analysisForModal}
      mode={mode}
      isOpen={isOpen}
      isActionPending={isPending}
      onClose={handleClose}
      onRetry={handleRetry}
      onRefresh={handleRefresh}
    />
  );
}

function isTerminalStatus(analysis: AnalysisRecord | null | undefined): boolean {
  return analysis?.status === "done" || analysis?.status === "error";
}

function pickActiveAnalysis(
  polled: AnalysisRecord | null,
  mutation: AnalysisRecord | null,
  initial: AnalysisRecord | null,
  articleUrl: string,
): AnalysisRecord | null {
  if (polled?.articleUrl === articleUrl) {
    return polled;
  }

  if (mutation?.articleUrl === articleUrl) {
    return mutation;
  }

  if (initial?.articleUrl === articleUrl) {
    return initial;
  }

  return null;
}
