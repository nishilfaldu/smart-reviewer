import { getGNewsApiKey } from "@/lib/env";
import { newsArticleSchema } from "@/lib/schemas";
import type { PaginatedNewsResult } from "@/lib/types";

interface GNewsResponse {
  totalArticles?: number;
  articles?: Array<{
    id?: string;
    title?: string;
    description?: string;
    content?: string;
    url?: string;
    image?: string;
    publishedAt?: string;
    lang?: string;
    source?: {
      id?: string;
      name?: string;
      url?: string;
      country?: string;
    };
  }>;
}

const GNEWS_PAGE_SIZE = 10;
const GNEWS_MAX_ARTICLES = 1_000;

export async function searchNews(input: {
  query: string;
  page: number;
}): Promise<PaginatedNewsResult> {
  const trimmedQuery = input.query.trim();
  const page = Math.max(1, Math.floor(input.page));

  if (!trimmedQuery) {
    return {
      articles: [],
      totalArticles: 0,
      page: 1,
      pageSize: GNEWS_PAGE_SIZE,
      totalPages: 0,
    };
  }

  const searchParams = new URLSearchParams({
    q: trimmedQuery,
    lang: "en",
    max: String(GNEWS_PAGE_SIZE),
    page: String(page),
    sortby: "publishedAt",
    apikey: getGNewsApiKey(),
  });

  const response = await fetch(
    `https://gnews.io/api/v4/search?${searchParams.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `GNews request failed with ${response.status}: ${message || response.statusText}`,
    );
  }

  const payload = (await response.json()) as GNewsResponse;

  const articles = (payload.articles ?? [])
    .filter((article): article is Required<GNewsResponse>["articles"][number] => {
      return Boolean(
        article?.id &&
          article?.title &&
          article.url &&
          article.publishedAt &&
          article.content &&
          article.source?.id &&
          article.source.name &&
          article.source.url &&
          article.source.country &&
          article.lang,
      );
    })
    .map((article) => {
      const source = article.source;

      if (!source) {
        throw new Error("GNews article is missing source information");
      }

      return newsArticleSchema.parse({
        id: article.id,
        title: article.title,
        description: article.description ?? "",
        content: article.content,
        url: article.url,
        image: article.image ?? null,
        publishedAt: article.publishedAt,
        lang: article.lang,
        source: {
          id: source.id,
          name: source.name,
          url: source.url,
          country: source.country,
        },
      });
    });

  const totalArticles = Math.min(
    Math.max(payload.totalArticles ?? articles.length, articles.length),
    GNEWS_MAX_ARTICLES,
  );
  const totalPages =
    totalArticles > 0 ? Math.ceil(totalArticles / GNEWS_PAGE_SIZE) : 0;

  return {
    articles,
    totalArticles,
    page,
    pageSize: GNEWS_PAGE_SIZE,
    totalPages,
  };
}
