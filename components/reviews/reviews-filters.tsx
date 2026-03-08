
import type { ReviewFilters } from "@/lib/types";

interface ReviewsFiltersProps {
  filters: ReviewFilters;
  onQueryChange: (value: string) => void;
  onSentimentChange: (value: ReviewFilters["sentiment"]) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}

export function ReviewsFilters({
  filters,
  onQueryChange,
  onSentimentChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: ReviewsFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_180px_180px_auto]">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Search
          </span>
          <input
            type="text"
            value={filters.query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search title, publisher, description, or summary"
            className="min-h-12 w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sentiment
          </span>
          <div className="relative">
            <select
              value={filters.sentiment}
              onChange={(event) =>
                onSentimentChange(event.target.value as ReviewFilters["sentiment"])
              }
              className="min-h-12 w-full appearance-none rounded-[1.2rem] border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-sky-400"
            >
              <option value="">All sentiments</option>
              <option value="very_positive">Very positive</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
              <option value="very_negative">Very negative</option>
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Published from
          </span>
          <input
            type="date"
            value={filters.dateFrom}
            onInput={(event) =>
              onDateFromChange((event.target as HTMLInputElement).value)
            }
            className="min-h-12 w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Published to
          </span>
          <input
            type="date"
            value={filters.dateTo}
            onInput={(event) =>
              onDateToChange((event.target as HTMLInputElement).value)
            }
            className="min-h-12 w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="min-h-12 w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}
