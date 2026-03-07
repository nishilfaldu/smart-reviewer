import { NextResponse } from "next/server";

import { getAnalysisById } from "@/lib/analysis-repository";
import { serializeAnalysis } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  return NextResponse.json(
    { analysis: serializeAnalysis(analysis) },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
