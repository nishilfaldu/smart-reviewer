"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { ArticleList } from "@/components/articles/article-list";
import { ArticleReviewFlow } from "@/components/review-dialog/article-review-flow";
import { SearchForm } from "@/components/search/search-form";
import { fetchNews } from "@/lib/api-client";
import type { NewsArticle } from "@/lib/types";

export function SmartReviewerDashboard({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [newsPage, setNewsPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewRunning, setIsReviewRunning] = useState(false);

  const articlesQuery = useQuery({
    queryKey: ["news", submittedQuery, newsPage],
    queryFn: () => fetchNews(submittedQuery, newsPage),
    enabled: Boolean(submittedQuery),
    placeholderData: (previous) => previous,
  });

  const newsResult = articlesQuery.data;
  const articles = newsResult?.articles ?? [];
  const isSearching = articlesQuery.isPending || articlesQuery.isFetching;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(searchInput.trim());
    setNewsPage(1);
  }

  function handleQueryChange(value: string) {
    setSearchInput(value);

    const nextQuery = value.trim();
    const nextUrl = nextQuery ? `/?q=${encodeURIComponent(nextQuery)}` : "/";

    router.replace(nextUrl, { scroll: false });

    if (!nextQuery) {
      setSubmittedQuery("");
      setNewsPage(1);
    }
  }

  function handleOpenReview(article: NewsArticle) {
    setSelectedArticle(article);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedArticle(null);
  }

  return (
    <main className="min-h-[calc(100vh-89px)] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_48%,_#f8fafc_100%)] px-4 py-8 text-slate-950 md:px-8 lg:px-12">
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
          isLoading={articlesQuery.isFetching}
        />

        <ArticleList
          query={submittedQuery}
          articles={articles}
          totalResults={newsResult?.totalArticles ?? 0}
          currentPage={newsResult?.page ?? newsPage}
          totalPages={newsResult?.totalPages ?? 0}
          isLoading={isSearching}
          hasError={Boolean(articlesQuery.error)}
          activeArticleUrl={selectedArticle?.url ?? null}
          isAnalyzing={isReviewRunning}
          onPageChange={setNewsPage}
          onOpenReview={handleOpenReview}
        />
      </div>

      <ArticleReviewFlow
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRunningChange={setIsReviewRunning}
      />
    </main>
  );
}
