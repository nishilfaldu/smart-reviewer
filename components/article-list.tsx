"use client";

import Image from "next/image";

import {
  formatCountryName,
  formatLanguageName,
  formatPublishedAt,
} from "@/lib/display";
import type { NewsArticle } from "@/lib/types";

interface ArticleListProps {
  articles: NewsArticle[];
  activeArticleUrl: string | null;
  isAnalyzing: boolean;
  onOpenReview: (article: NewsArticle) => void;
}

export function ArticleList({
  articles,
  activeArticleUrl,
  isAnalyzing,
  onOpenReview,
}: ArticleListProps) {
  if (!articles.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500">
        Run a search to load recent articles.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {articles.map((article) => {
        const isActive = article.url === activeArticleUrl;

        return (
          <article
            key={article.url}
            className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur lg:grid-cols-[160px_1fr_auto]"
          >
            <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
              {article.image ? (
                <Image
                  src={article.image}
                  alt={article.title}
                  width={320}
                  height={220}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full min-h-36 items-center justify-center bg-[linear-gradient(135deg,_#dbeafe_0%,_#f8fafc_100%)] px-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {article.source.name}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>{article.source.name}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{formatCountryName(article.source.country)}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{formatLanguageName(article.lang)}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{formatPublishedAt(article.publishedAt)}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-950">
                  {article.title}
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  {article.description || "No description available from GNews."}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex font-medium text-sky-700 transition hover:text-sky-900"
                >
                  Open article
                </a>
                <a
                  href={article.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex font-medium text-slate-600 transition hover:text-slate-900"
                >
                  Source site
                </a>
              </div>
            </div>
            <div className="flex items-start lg:items-center">
              <button
                type="button"
                onClick={() => onOpenReview(article)}
                className="min-w-32 rounded-full border border-slate-200 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isActive && isAnalyzing ? "Analyzing..." : "Open Review"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
