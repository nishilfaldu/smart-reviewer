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
    case "very_positive":
      return "bg-emerald-200 text-emerald-900";
    case "positive":
      return "bg-emerald-100 text-emerald-800";
    case "negative":
      return "bg-rose-100 text-rose-800";
    case "very_negative":
      return "bg-rose-200 text-rose-900";
    case "neutral":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-sky-100 text-sky-800";
  }
}

const sentimentLabels: Record<string, string> = {
  very_positive: "Very positive",
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
  very_negative: "Very negative",
};

export function formatSentimentLabel(
  sentiment: AnalysisRecord["sentiment"],
): string {
  if (!sentiment) {
    return "Unknown";
  }

  return sentimentLabels[sentiment] ?? sentiment;
}

export function getNewsErrorMessage(): string {
  return "Couldn’t load articles right now. Please try again in a moment.";
}

export function getReviewStartErrorMessage(): string {
  return "Couldn’t start this review right now. Please try again.";
}

export function getReviewsLoadErrorMessage(): string {
  return "Couldn’t load completed reviews right now. Please try again in a moment.";
}

export function getReviewFailureMessage(
  errorMessage?: string | null,
): string {
  const normalized = errorMessage?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return "This article couldn’t be reviewed right now. You can retry or choose another article.";
  }

  if (normalized.includes("403") || normalized.includes("forbidden")) {
    return "This source blocked access to the article content. Try retrying or choose another article.";
  }

  if (normalized.includes("timeout") || normalized.includes("timed out")) {
    return "This review took too long to prepare. Please retry.";
  }

  if (
    normalized.includes("missing content") ||
    normalized.includes("content is missing")
  ) {
    return "This article does not include enough content to prepare a review.";
  }

  return "This article couldn’t be reviewed right now. You can retry or choose another article.";
}
