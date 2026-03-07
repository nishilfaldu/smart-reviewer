import type { AnalysisRecord } from "@/lib/types";

const countryNames =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const languageNames =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "language" })
    : null;

export function formatCountryName(code: string): string {
  const normalized = code.trim().toUpperCase();

  if (!normalized) {
    return "Unknown country";
  }

  return countryNames?.of(normalized) ?? normalized;
}

export function formatLanguageName(code: string): string {
  const normalized = code.trim().toLowerCase();

  if (!normalized) {
    return "Unknown language";
  }

  return languageNames?.of(normalized) ?? normalized.toUpperCase();
}

export function formatPublishedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getSentimentClasses(
  sentiment: AnalysisRecord["sentiment"],
): string {
  switch (sentiment) {
    case "positive":
      return "bg-emerald-100 text-emerald-800";
    case "negative":
      return "bg-rose-100 text-rose-800";
    case "neutral":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-sky-100 text-sky-800";
  }
}
