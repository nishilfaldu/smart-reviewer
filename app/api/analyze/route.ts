import { NextResponse } from "next/server";

import {
  createPendingAnalysis,
  getAnalysisById,
  markAnalysisProcessing,
  syncAnalysisArticle,
} from "@/lib/analysis-repository";
import { startAnalysisJob } from "@/lib/analyze-job";
import { createArticleId, normalizeArticleUrl } from "@/lib/article-id";
import { analyzeBodySchema } from "@/lib/schemas";
import { serializeAnalysis, type NewsArticle } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = analyzeBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "A complete article payload is required" },
      { status: 400 },
    );
  }

  const article = parsedBody.data.article;
  const title = article.title.trim();
  const rawUrl = article.url.trim();
  const articleContent = article.content.trim();

  try {
    const articleUrl = normalizeArticleUrl(rawUrl);
    const normalizedArticle: NewsArticle = {
      ...article,
      title,
      url: articleUrl,
      content: articleContent,
      description: article.description?.trim() ?? "",
      image: article.image ?? null,
      publishedAt: article.publishedAt,
      lang: article.lang,
      source: {
        ...article.source,
        name: article.source.name.trim(),
        url: article.source.url.trim(),
        country: article.source.country.trim(),
      },
    };
    const id = createArticleId(articleUrl);
    const existing = await getAnalysisById(id);

    if (existing) {
      const synced = await syncAnalysisArticle({ id, article: normalizedArticle });
      let responseAnalysis = synced ?? existing;

      if (responseAnalysis.status === "error") {
        responseAnalysis =
          (await markAnalysisProcessing(id)) ?? responseAnalysis;
      }

      if (responseAnalysis.status !== "done") {
        void startAnalysisJob({
          id,
          title: normalizedArticle.title,
          articleUrl,
          article: normalizedArticle,
        });
      }

      return NextResponse.json(
        {
          id,
          analysis: serializeAnalysis(responseAnalysis),
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    await createPendingAnalysis({ id, article: normalizedArticle });
    void startAnalysisJob({
      id,
      title,
      articleUrl,
      article: normalizedArticle,
    });

    const pending = await getAnalysisById(id);

    return NextResponse.json(
      {
        id,
        analysis: pending ? serializeAnalysis(pending) : undefined,
      },
      {
        status: 202,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start analysis";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
