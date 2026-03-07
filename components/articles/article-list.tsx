"use client";

import { ArticleCard } from "@/components/articles/article-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getNewsErrorMessage } from "@/lib/display";
import type { NewsArticle } from "@/lib/types";

interface ArticleListProps {
  query: string;
  articles: NewsArticle[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  hasError: boolean;
  activeArticleUrl: string | null;
  isAnalyzing: boolean;
  onPageChange: (page: number) => void;
  onOpenReview: (article: NewsArticle) => void;
}

export function ArticleList({
  query,
  articles,
  totalResults,
  currentPage,
  totalPages,
  isLoading,
  hasError,
  activeArticleUrl,
  isAnalyzing,
  onPageChange,
  onOpenReview,
}: ArticleListProps) {
  const resultsLabel = query ? totalResults : 0;

  return (
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
        <p className="text-sm text-slate-500">{resultsLabel} results</p>
      </div>

      {hasError ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
          {getNewsErrorMessage()}
        </div>
      ) : null}

      {!query ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500">
          Search for a topic to load recent articles and start a review.
        </div>
      ) : null}

      {query && isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[160px_minmax(0,1fr)_auto]"
            >
              <div className="h-40 w-40 animate-pulse rounded-[1.5rem] bg-slate-200" />
              <div className="space-y-4 py-2">
                <div className="h-3 w-48 animate-pulse rounded-full bg-slate-200" />
                <div className="h-8 w-5/6 animate-pulse rounded-[0.75rem] bg-slate-200" />
                <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
                <div className="flex gap-3">
                  <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="flex items-start lg:items-center">
                <div className="h-12 w-36 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {query && !isLoading && !hasError && !articles.length ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500">
          No recent articles matched this search. Try a broader topic or a different phrase.
        </div>
      ) : null}

      {articles.length ? (
        <div className="grid gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.url}
              article={article}
              isActive={article.url === activeArticleUrl}
              isAnalyzing={isAnalyzing}
              onOpenReview={onOpenReview}
            />
          ))}
        </div>
      ) : null}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </section>
  );
}
