
import Image from "next/image";

import { ReviewCompletedState } from "@/components/review-dialog/review-completed-state";
import { ReviewErrorState } from "@/components/review-dialog/review-error-state";
import { ReviewProgressState } from "@/components/review-dialog/review-progress-state";
import { BaseDialog } from "@/components/ui/base-dialog";
import { BaseDialogClose } from "@/components/ui/base-dialog-close";
import { BaseDialogContent } from "@/components/ui/base-dialog-content";
import {
  formatCountryName,
  formatLanguageName,
  formatPublishedAt,
} from "@/lib/display";
import type { AnalysisRecord, NewsArticle } from "@/lib/types";

export type ArticleReviewMode = "opening" | "processing" | "error" | "done";

interface ArticleReviewModalProps {
  article: NewsArticle | null;
  analysis: AnalysisRecord | null;
  mode: ArticleReviewMode;
  isOpen: boolean;
  isActionPending: boolean;
  onClose: () => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export function ArticleReviewModal({
  article,
  analysis,
  mode,
  isOpen,
  isActionPending,
  onClose,
  onRetry,
  onRefresh,
}: ArticleReviewModalProps) {
  if (!article) {
    return null;
  }

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <BaseDialogContent className="h-[min(92vh,920px)] max-w-6xl min-h-0">
        <div className="grid h-full min-h-0 lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col border-b border-slate-200 bg-slate-950 text-white lg:border-b-0 lg:border-r">
            <div className="shrink-0 overflow-hidden">
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

            <div className="flex min-h-0 flex-1 flex-col p-6">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/70">
                    Review
                  </p>
                  <h2 className="mt-2 text-[clamp(1.7rem,3vw,2.55rem)] font-semibold leading-tight">
                    {article.title}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  <span>{article.source.name}</span>
                  <span>{formatCountryName(article.source.country)}</span>
                  <span>{formatLanguageName(article.lang)}</span>
                </div>

                <p className="text-sm text-slate-300">
                  {formatPublishedAt(article.publishedAt)}
                </p>
              </div>

              <div className="mt-6 flex shrink-0 flex-col gap-3 border-t border-white/10 pt-6">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-sky-300/40 bg-sky-300/10 px-4 py-2.5 font-semibold text-sky-200 transition hover:border-sky-200/60 hover:bg-sky-300/15 hover:text-white"
                >
                  Source article
                </a>
                <a
                  href={article.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Publisher site
                </a>
              </div>
            </div>
          </div>

          <div className="min-h-0 bg-white">
            <div className="h-full overflow-y-scroll overscroll-contain">
              <div className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:px-8">
                {mode === "done" ? (
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isActionPending}
                    className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,_#0f172a_0%,_#0369a1_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(14,165,233,0.24)] transition hover:shadow-[0_16px_40px_rgba(14,165,233,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isActionPending ? "Refreshing..." : "Refresh review"}
                  </button>
                ) : null}

                <BaseDialogClose className="static border-slate-200 bg-slate-50 px-4 py-2.5 text-sm tracking-[0.18em] text-slate-700 hover:bg-white" />
              </div>

              <div className="flex min-h-full flex-col gap-6 p-6 pb-16 md:px-8 md:pb-20 md:pt-6">
                {mode === "opening" || mode === "processing" ? (
                  <ReviewProgressState mode={mode} />
                ) : null}

                {mode === "error" ? (
                  <ReviewErrorState
                    errorMessage={analysis?.errorMessage}
                    isActionPending={isActionPending}
                    onRetry={onRetry}
                  />
                ) : null}

                {mode === "done" ? (
                  <ReviewCompletedState
                    article={article}
                    analysis={analysis}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </BaseDialogContent>
    </BaseDialog>
  );
}
