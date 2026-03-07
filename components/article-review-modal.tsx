"use client";

import Image from "next/image";
import { useEffect } from "react";

import {
  formatCountryName,
  formatLanguageName,
  formatPublishedAt,
  getSentimentClasses,
} from "@/lib/display";
import type { AnalysisRecord, NewsArticle } from "@/lib/types";

interface ArticleReviewModalProps {
  article: NewsArticle | null;
  analysis: AnalysisRecord | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

export function ArticleReviewModal({
  article,
  analysis,
  isOpen,
  isLoading,
  onClose,
}: ArticleReviewModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !article) {
    return null;
  }

  const status = analysis?.status ?? (isLoading ? "processing" : "pending");
  const isOpening = !analysis && isLoading;
  const isDone = status === "done";
  const isError = status === "error";
  const isProcessing = !isOpening && !isDone && !isError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.32)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          Close
        </button>

        <div className="grid h-full lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="border-b border-slate-200 bg-slate-950 text-white lg:border-b-0 lg:border-r">
            <div className="overflow-hidden">
              {article.image ? (
                <Image
                  src={article.image}
                  alt={article.title}
                  width={560}
                  height={420}
                  className="h-60 w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-60 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.22),_transparent_55%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-8 text-center text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                  {article.source.name}
                </div>
              )}
            </div>

            <div className="space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/70">
                  Review
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{article.title}</h2>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <span>{article.source.name}</span>
                <span>{formatCountryName(article.source.country)}</span>
                <span>{formatLanguageName(article.lang)}</span>
              </div>

              <p className="text-sm leading-7 text-slate-300">
                {article.description || "No description available."}
              </p>

              <div className="space-y-2 text-sm text-slate-300">
                <p>{formatPublishedAt(article.publishedAt)}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex font-medium text-sky-300 transition hover:text-sky-200"
                >
                  Open article
                </a>
                <br />
                <a
                  href={article.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex font-medium text-slate-300 transition hover:text-white"
                >
                  Visit source
                </a>
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Status
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-950">
                  {isOpening
                    ? "Opening review"
                    : isDone
                    ? "Review ready"
                    : isError
                      ? "Review failed"
                      : "Review in progress"}
                </h3>
              </div>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${getSentimentClasses(
                  isDone ? analysis?.sentiment ?? null : null,
                )}`}
              >
                {isOpening ? "loading" : isDone ? analysis?.sentiment ?? "ready" : status}
              </span>
            </div>

            {isOpening ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Checking for an existing review
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Pulling the latest status for this article.
                </p>
                <div className="mt-5 space-y-3">
                  <div className="h-3 w-40 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            ) : null}

            {isProcessing ? (
              <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Preparing your review
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The article is queued and this dialog will update automatically
                  as soon as the review is ready.
                </p>
                <div className="mt-5 space-y-3">
                  <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            ) : null}

            {isError ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
                {analysis?.errorMessage ?? "Something went wrong while creating the review."}
              </div>
            ) : null}

            {isDone ? (
              <>
                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Summary
                  </p>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    {analysis?.summary}
                  </div>
                </section>

                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Sentiment
                  </p>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <span
                      className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${getSentimentClasses(
                        analysis?.sentiment ?? null,
                      )}`}
                    >
                      {analysis?.sentiment}
                    </span>
                  </div>
                </section>

                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Source preview
                  </p>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
                    {article.content}
                  </div>
                </section>
              </>
            ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
