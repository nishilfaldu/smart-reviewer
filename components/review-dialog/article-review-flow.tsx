"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  ArticleReviewModal,
  type ArticleReviewMode,
} from "@/components/review-dialog/article-review-modal";
import { analyzeNewsArticle, fetchAnalysis } from "@/lib/api-client";
import { getReviewStartErrorMessage } from "@/lib/display";
import type { AnalysisRecord, NewsArticle } from "@/lib/types";

interface ArticleReviewFlowProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onRunningChange: (isRunning: boolean) => void;
}

export function ArticleReviewFlow({
  article,
  isOpen,
  onClose,
  onRunningChange,
}: ArticleReviewFlowProps) {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const analysisQuery = useQuery({
    queryKey: ["result", activeJobId],
    queryFn: () => fetchAnalysis(activeJobId as string),
    enabled: Boolean(activeJobId),
    refetchInterval: (query) => {
      const status = query.state.data?.analysis.status;

      if (!activeJobId) {
        return false;
      }

      return status === "done" || status === "error" ? false : 2_000;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeNewsArticle,
    onMutate: () => {
      setActiveJobId(null);
    },
    onSuccess: (payload) => {
      const status = payload.analysis?.status;

      if (status === "pending" || status === "processing") {
        setActiveJobId(payload.id);
        return;
      }

      setActiveJobId(null);
    },
  });

  const { data, error, isPending, mutate, reset } = analyzeMutation;

  useEffect(() => {
    if (!isOpen || !article) {
      return;
    }

    reset();
    mutate({ article });
  }, [article, isOpen, mutate, reset]);

  const activeAnalysis: AnalysisRecord | null =
    (isPending ? [] : [analysisQuery.data?.analysis, data?.analysis]
    ).find((candidate) => candidate?.articleUrl === article?.url) ?? null;

  const isLoadingReview = isPending && !activeAnalysis && isOpen;
  const isPolling =
    isOpen &&
    (Boolean(activeJobId) ||
    activeAnalysis?.status === "pending" ||
    activeAnalysis?.status === "processing");

  useEffect(() => {
    onRunningChange(isLoadingReview || isPolling);
  }, [isLoadingReview, isPolling, onRunningChange]);

  function handleRetry() {
    if (!article) {
      return;
    }

    reset();
    mutate({ article });
  }

  function handleClose() {
    setActiveJobId(null);
    reset();
    onRunningChange(false);
    onClose();
  }

  let mode: ArticleReviewMode = "processing";

  if (error && !activeAnalysis) {
    mode = "error";
  } else if (activeAnalysis?.status === "done") {
    mode = "done";
  } else if (activeAnalysis?.status === "error") {
    mode = "error";
  } else if (!activeAnalysis && isLoadingReview) {
    mode = "opening";
  }

  const analysisForModal =
    error && !activeAnalysis
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
          errorMessage: getReviewStartErrorMessage(),
        }
      : activeAnalysis;

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
