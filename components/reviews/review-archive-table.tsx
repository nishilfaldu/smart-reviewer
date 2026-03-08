
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

interface ReviewArchiveTableProps {
  analyses: AnalysisRecord[];
  onViewReview: (analysis: AnalysisRecord) => void;
}

export function ReviewArchiveTable({
  analyses,
  onViewReview,
}: ReviewArchiveTableProps) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="min-w-full text-left">
        <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <tr>
            <th className="px-6 py-4">Article</th>
            <th className="px-6 py-4">Published</th>
            <th className="px-6 py-4">Reviewed</th>
            <th className="px-6 py-4">Sentiment</th>
            <th className="px-6 py-4">Summary</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((analysis) => (
            <tr
              key={analysis.id}
              className="border-b border-slate-100 align-top last:border-b-0"
            >
              <td className="px-6 py-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {analysis.article.source.name}
                  </p>
                  <p className="max-w-xl text-base font-semibold text-slate-950">
                    {analysis.title}
                  </p>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-slate-600">
                {formatPublishedAt(analysis.article.publishedAt)}
              </td>
              <td className="px-6 py-5 text-sm text-slate-600">
                {formatPublishedAt(analysis.updatedAt)}
              </td>
              <td className="px-6 py-5">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getSentimentClasses(
                    analysis.sentiment,
                  )}`}
                >
                  {formatSentimentLabel(analysis.sentiment)}
                </span>
              </td>
              <td className="px-6 py-5 text-sm leading-7 text-slate-600">
                <p className="max-w-md">{truncateSummary(analysis.summary)}</p>
              </td>
              <td className="px-6 py-5">
                <div className="flex justify-end gap-3">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
