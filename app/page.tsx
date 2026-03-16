import { connection } from "next/server";

import { SmartReviewerDashboard } from "@/components/search/smart-reviewer-dashboard";

export default async function Home() {
  await connection();

  return <SmartReviewerDashboard />;
}
