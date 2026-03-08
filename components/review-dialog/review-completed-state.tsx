
import { formatSentimentLabel, getSentimentClasses } from "@/lib/display";
import type { AnalysisRecord, NewsArticle } from "@/lib/types";

interface ReviewCompletedStateProps {
  article: NewsArticle;
  analysis: AnalysisRecord | null;
}

export function ReviewCompletedState({
  article,
  analysis,
}: ReviewCompletedStateProps) {
  return (
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
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getSentimentClasses(
              analysis?.sentiment ?? null,
            )}`}
          >
            {formatSentimentLabel(analysis?.sentiment ?? null)}
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Article details
        </p>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
          {article.description || "No description available."}
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
  );
}
