"use client";

import {
  formatPublishedAt,
  formatSentimentLabel,
  getSentimentClasses,
} from "@/lib/display";
import type { AnalysisRecord } from "@/lib/types";

function truncateSummary(summary: string | null): string {
  if (!summary) {
    return "No summary available.";
  }

  return summary.length > 180 ? `${summary.slice(0, 177)}...` : summary;
}

interface ReviewArchiveCardProps {
  analysis: AnalysisRecord;
  onViewReview: (analysis: AnalysisRecord) => void;
}

export function ReviewArchiveCard({
  analysis,
  onViewReview,
}: ReviewArchiveCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {analysis.article.source.name}
          </p>
          <h3 className="text-lg font-semibold text-slate-950">{analysis.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>{formatPublishedAt(analysis.article.publishedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{formatPublishedAt(analysis.updatedAt)}</span>
        </div>

        <div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getSentimentClasses(
              analysis.sentiment,
            )}`}
          >
            {formatSentimentLabel(analysis.sentiment)}
          </span>
        </div>

        <p className="text-sm leading-7 text-slate-600">
          {truncateSummary(analysis.summary)}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onViewReview(analysis)}
            className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-slate-800 hover:bg-slate-800"
          >
            View review
          </button>
          <a
            href={analysis.articleUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Source article
          </a>
        </div>
      </div>
    </article>
  );
}
