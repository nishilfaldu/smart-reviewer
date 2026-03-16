import { connection } from "next/server";

import { ReviewsDashboard } from "@/components/reviews/reviews-dashboard";

export default async function ReviewsPage() {
  await connection();

  return <ReviewsDashboard />;
}
