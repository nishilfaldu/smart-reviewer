import { NextResponse } from "next/server";

import { searchNews } from "@/lib/gnews";
// import { getCachedNews, setCachedNews } from "@/lib/news-cache";

// NOTE: A previous version of this route cached GNews responses in memory
// using lib/news-cache.ts (globalThis Map with a 5-minute TTL). That works
// well for long-lived Node processes where the same Map persists across
// requests, but on Vercel serverless each invocation may start in a fresh
// container with an empty cache. The cache implementation is kept in
// lib/news-cache.ts for reference but is no longer used here.

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
    // const cached = getCachedNews(query, page);
    //
    // if (cached) {
    //   return NextResponse.json(
    //     cached,
    //     {
    //       headers: {
    //         "Cache-Control": "no-store",
    //       },
    //     },
    //   );
    // }

    const result = await searchNews({ query, page });
    // setCachedNews(query, page, result);

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
