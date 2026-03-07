import { SmartReviewerDashboard } from "@/components/smart-reviewer-dashboard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() || "artificial intelligence";

  return <SmartReviewerDashboard initialQuery={initialQuery} />;
}
