import { NextResponse } from "next/server";

import { listCompletedAnalyses } from "@/lib/analysis-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const analyses = await listCompletedAnalyses();

    return NextResponse.json(
      { analyses },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analyses";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
