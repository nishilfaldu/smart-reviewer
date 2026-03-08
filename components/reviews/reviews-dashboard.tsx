"use client";

import { useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { ArticleReviewModal } from "@/components/review-dialog/article-review-modal";
import { ReviewArchiveCard } from "@/components/reviews/review-archive-card";
import { ReviewsFilters } from "@/components/reviews/reviews-filters";
import { ReviewArchiveTable } from "@/components/reviews/review-archive-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { fetchCompletedAnalyses } from "@/lib/api-client";
import { getReviewsLoadErrorMessage } from "@/lib/display";
import type { AnalysisRecord, ReviewFilters } from "@/lib/types";
import { useState } from "react";

function parsePageParam(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function filtersFromParams(params: URLSearchParams): ReviewFilters {
  return {
    query: params.get("q")?.trim() || "",
    sentiment: (params.get("sentiment") as ReviewFilters["sentiment"]) || "",
    dateFrom: params.get("dateFrom") || "",
    dateTo: params.get("dateTo") || "",
  };
}

export function ReviewsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));
  const filters = filtersFromParams(searchParams);
  const deferredQuery = useDeferredValue(filters.query);
  const activeFilters = { ...filters, query: deferredQuery };
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(
    null,
  );

  function replaceParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }

    const qs = next.toString();
    router.replace(qs ? `/reviews?${qs}` : "/reviews", { scroll: false });
  }

  function updateFilter(key: string, value: string) {
    replaceParams({ [key]: value || null, page: null });
  }

  function clearFilters() {
    router.replace("/reviews", { scroll: false });
  }

  const reviewsQuery = useQuery({
    queryKey: [
      "completed-analyses",
      page,
      activeFilters.query,
      activeFilters.sentiment,
      activeFilters.dateFrom,
      activeFilters.dateTo,
    ],
    queryFn: () => fetchCompletedAnalyses({ page, filters: activeFilters }),
    placeholderData: (previous) => previous,
  });

  const results = reviewsQuery.data;
  const analyses = results?.analyses ?? [];
  const hasActiveFilters = Boolean(
    filters.query || filters.sentiment || filters.dateFrom || filters.dateTo,
  );

  return (
    <main className="min-h-[calc(100vh-89px)] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_45%,_#f8fafc_100%)] px-4 py-8 text-slate-950 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_28px_100px_rgba(15,23,42,0.28)] md:px-10 md:py-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.26),_transparent_56%)] lg:block" />
          <div className="relative max-w-3xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200/80">
              Reviews
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
              Revisit completed reviews without interrupting search.
            </h1>
          </div>
        </section>

        {reviewsQuery.error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
            {getReviewsLoadErrorMessage()}
          </div>
        ) : null}

        <ReviewsFilters
          filters={filters}
          onQueryChange={(value) => updateFilter("q", value)}
          onSentimentChange={(value) => updateFilter("sentiment", value)}
          onDateFromChange={(value) => updateFilter("dateFrom", value)}
          onDateToChange={(value) => updateFilter("dateTo", value)}
          onClear={clearFilters}
        />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Archive
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Completed reviews
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              {results?.totalAnalyses ?? 0} reviews
            </p>
          </div>

          {reviewsQuery.isLoading ? (
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="space-y-4">
                <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
                <div className="h-16 animate-pulse rounded-[1.25rem] bg-slate-100" />
                <div className="h-16 animate-pulse rounded-[1.25rem] bg-slate-100" />
                <div className="h-16 animate-pulse rounded-[1.25rem] bg-slate-100" />
              </div>
            </div>
          ) : null}

          {!reviewsQuery.isLoading && !analyses.length ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500">
              {hasActiveFilters
                ? "No reviews match these filters yet. Adjust the filters or clear them to see more."
                : "Completed reviews will appear here after you analyze articles."}
            </div>
          ) : null}

          {analyses.length ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="grid gap-4 p-4 lg:hidden">
                  {analyses.map((analysis) => (
                    <ReviewArchiveCard
                      key={analysis.id}
                      analysis={analysis}
                      onViewReview={setSelectedAnalysis}
                    />
                  ))}
                </div>

                <ReviewArchiveTable
                  analyses={analyses}
                  onViewReview={setSelectedAnalysis}
                />
              </div>

              <PaginationControls
                currentPage={results?.page ?? page}
                totalPages={results?.totalPages ?? 0}
                isLoading={reviewsQuery.isFetching}
                onPageChange={(p) =>
                  replaceParams({ page: p > 1 ? String(p) : null })
                }
              />
            </div>
          ) : null}
        </section>
      </div>

      <ArticleReviewModal
        article={selectedAnalysis?.article ?? null}
        analysis={selectedAnalysis}
        mode="done"
        isOpen={Boolean(selectedAnalysis)}
        isRetrying={false}
        onClose={() => setSelectedAnalysis(null)}
        onRetry={() => undefined}
      />
    </main>
  );
}
