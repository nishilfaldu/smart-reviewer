import { ReviewsDashboard } from "@/components/reviews/reviews-dashboard";
import type { ReviewFilters } from "@/lib/types";

function parsePageParam(value?: string): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function parseFilters(params: {
  q?: string;
  sentiment?: string;
  dateFrom?: string;
  dateTo?: string;
}): ReviewFilters {
  return {
    query: params.q?.trim() || "",
    sentiment: (params.sentiment as ReviewFilters["sentiment"]) || "",
    dateFrom: params.dateFrom || "",
    dateTo: params.dateTo || "",
  };
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sentiment?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <ReviewsDashboard
      initialPage={parsePageParam(params.page)}
      initialFilters={parseFilters(params)}
    />
  );
}
