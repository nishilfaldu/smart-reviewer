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
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleReviewFlow({
  article,
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

  // On mount (modal opens for an article): fire POST /api/analyze.
  // The server checks DB — returns existing record if found, starts a
  // new job only when needed.
  useEffect(() => {
    if (!isOpen || !article) {
      return;
    }

    reset();
    mutate({ article });
  }, [article, isOpen, mutate, reset]);

  // Poll GET /api/result/[id] while the analysis is pending or processing.
  // Polling stops when status reaches a terminal state (done / error) or
  // when the modal unmounts.
  const analysisQuery = useQuery({
    queryKey: ["result", jobId],
    queryFn: () => fetchAnalysis(jobId as string),
    enabled:
      Boolean(jobId) &&
      isOpen &&
      !isPending &&
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
      : pickActiveAnalysis(polledAnalysis, mutationAnalysis, article.url);

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
    mutate({ article });
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
      isRetrying={isPending}
      onClose={handleClose}
      onRetry={handleRetry}
    />
  );
}

function isTerminalStatus(analysis: AnalysisRecord | null | undefined): boolean {
  return analysis?.status === "done" || analysis?.status === "error";
}

function pickActiveAnalysis(
  polled: AnalysisRecord | null,
  mutation: AnalysisRecord | null,
  articleUrl: string,
): AnalysisRecord | null {
  if (polled?.articleUrl === articleUrl) {
    return polled;
  }

  if (mutation?.articleUrl === articleUrl) {
    return mutation;
  }

  return null;
}
