import { NextResponse } from "next/server";

import { listCompletedAnalyses } from "@/lib/analysis-repository";
import { sentimentSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const RESULTS_PAGE_SIZE = 10;

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseOptionalDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const query = searchParams.get("q")?.trim() ?? "";
  const sentimentParam = searchParams.get("sentiment");
  const sentiment = sentimentParam
    ? sentimentSchema.safeParse(sentimentParam)
    : null;
  const dateFrom = parseOptionalDate(searchParams.get("dateFrom"));
  const dateTo = parseOptionalDate(searchParams.get("dateTo"));

  if (sentimentParam && !sentiment?.success) {
    return NextResponse.json(
      { error: "Invalid sentiment filter" },
      { status: 400 },
    );
  }

  if (searchParams.get("dateFrom") && !dateFrom) {
    return NextResponse.json(
      { error: "Invalid dateFrom filter" },
      { status: 400 },
    );
  }

  if (searchParams.get("dateTo") && !dateTo) {
    return NextResponse.json(
      { error: "Invalid dateTo filter" },
      { status: 400 },
    );
  }

  try {
    const result = await listCompletedAnalyses({
      page,
      pageSize: RESULTS_PAGE_SIZE,
      query,
      sentiment: sentiment?.success ? sentiment.data : undefined,
      dateFrom: dateFrom ?? undefined,
      dateTo: dateTo
        ? new Date(`${searchParams.get("dateTo")}T23:59:59.999Z`)
        : undefined,
    });

    return NextResponse.json(
      result,
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
