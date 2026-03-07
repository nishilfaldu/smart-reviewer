import { NextResponse } from "next/server";

import { searchNews } from "@/lib/gnews";
import { getCachedNews, setCachedNews } from "@/lib/news-cache";

export const runtime = "nodejs";

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const page = parsePage(searchParams.get("page"));

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter q is required" },
      { status: 400 },
    );
  }

  try {
    const cached = getCachedNews(query, page);

    if (cached) {
      return NextResponse.json(
        cached,
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const result = await searchNews({ query, page });
    setCachedNews(query, page, result);

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
      error instanceof Error ? error.message : "Failed to fetch news";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
