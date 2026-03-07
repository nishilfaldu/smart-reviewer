"use client";

interface ReviewProgressStateProps {
  mode: "opening" | "processing";
}

export function ReviewProgressState({ mode }: ReviewProgressStateProps) {
  if (mode === "opening") {
    return (
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
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50 p-5">
      <p className="text-sm font-semibold text-slate-900">Preparing your review</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        The article is queued and this dialog will update automatically as soon
        as the review is ready.
      </p>
      <div className="mt-5 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
