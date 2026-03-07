import { getGNewsApiKey } from "@/lib/env";
import { newsArticleSchema } from "@/lib/schemas";
import type { NewsArticle } from "@/lib/types";

interface GNewsResponse {
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

export async function searchNews(query: string): Promise<NewsArticle[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const searchParams = new URLSearchParams({
    q: trimmedQuery,
    lang: "en",
    max: "10",
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

  return (payload.articles ?? [])
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
}
