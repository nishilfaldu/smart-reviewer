import { NextResponse } from "next/server";

import { searchNews } from "@/lib/gnews";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter q is required" },
      { status: 400 },
    );
  }

  try {
    const articles = await searchNews(query);

    return NextResponse.json(
      { articles },
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
