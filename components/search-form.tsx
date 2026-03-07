"use client";

interface SearchFormProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function SearchForm({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
}: SearchFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="sr-only" htmlFor="news-query">
          Search for news
        </label>
        <input
          id="news-query"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search recent news about climate, markets, AI, policy..."
          className="min-h-14 flex-1 rounded-[1.35rem] border border-slate-200 bg-white px-5 text-base text-slate-900 outline-none transition focus:border-sky-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-14 rounded-[1.35rem] bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Searching..." : "Search News"}
        </button>
      </div>
    </form>
  );
}
