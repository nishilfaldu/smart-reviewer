import { SmartReviewerDashboard } from "@/components/search/smart-reviewer-dashboard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() || "";

  return <SmartReviewerDashboard initialQuery={initialQuery} />;
}
