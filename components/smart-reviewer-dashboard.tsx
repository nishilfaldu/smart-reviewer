"use client";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ArticleList } from "@/components/article-list";
import { ArticleReviewModal } from "@/components/article-review-modal";
import { SearchForm } from "@/components/search-form";
import {
  analyzeNewsArticle,
  fetchAnalysis,
  fetchNews,
} from "@/lib/api-client";
import type { AnalysisRecord, NewsArticle } from "@/lib/types";

export function SmartReviewerDashboard({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeArticleUrl, setActiveArticleUrl] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isSearchPending, startSearchTransition] = useTransition();

  const newsQuery = useQuery({
    queryKey: ["news", submittedQuery],
    queryFn: () => fetchNews(submittedQuery),
    enabled: Boolean(submittedQuery),
  });

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
    onMutate: ({ article }) => {
      setActiveArticleUrl(article.url);
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

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchInput.trim();

    if (!nextQuery) {
      return;
    }

    startSearchTransition(() => {
      setSubmittedQuery(nextQuery);
    });
  }

  function handleQueryChange(value: string) {
    setSearchInput(value);

    const nextQuery = value.trim();
    const nextUrl = nextQuery ? `/?q=${encodeURIComponent(nextQuery)}` : "/";

    router.replace(nextUrl, { scroll: false });
  }

  function handleOpenReview(article: NewsArticle) {
    setSelectedArticle(article);
    setIsModalOpen(true);
    analyzeMutation.reset();
    analyzeMutation.mutate({
      article,
    });
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  const activeAnalysis: AnalysisRecord | null =
    [analysisQuery.data?.analysis, analyzeMutation.data?.analysis].find(
      (analysis) => analysis?.articleUrl === selectedArticle?.url,
    ) ?? null;

  const isLoadingReview =
    analyzeMutation.isPending && !activeAnalysis && isModalOpen;

  const isPolling =
    Boolean(activeJobId) ||
    activeAnalysis?.status === "pending" ||
    activeAnalysis?.status === "processing";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_48%,_#f8fafc_100%)] px-4 py-8 text-slate-950 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_28px_100px_rgba(15,23,42,0.28)] md:px-10 md:py-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(125,211,252,0.24),_transparent_52%)] lg:block" />
          <div className="relative max-w-3xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/80">
              Smart Reviewer
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
              Open a story and get a clean review in one place.
            </h1>
          </div>
        </section>

        <SearchForm
          query={searchInput}
          onQueryChange={handleQueryChange}
          onSubmit={handleSearchSubmit}
          isLoading={newsQuery.isFetching || isSearchPending}
        />

        {newsQuery.error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
            {newsQuery.error.message}
          </div>
        ) : null}

        {analyzeMutation.error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
            {analyzeMutation.error.message}
          </div>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                News
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Recent articles
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              {newsQuery.data?.articles.length ?? 0} results
            </p>
          </div>
          <ArticleList
            articles={newsQuery.data?.articles ?? []}
            activeArticleUrl={activeArticleUrl}
            isAnalyzing={isPolling}
            onOpenReview={handleOpenReview}
          />
        </section>
      </div>

      <ArticleReviewModal
        article={selectedArticle}
        analysis={activeAnalysis}
        isOpen={isModalOpen}
        isLoading={isLoadingReview || isPolling}
        onClose={handleCloseModal}
      />
    </main>
  );
}
