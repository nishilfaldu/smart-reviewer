import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";

import { getOpenAiApiKey, getOpenAiModel } from "@/lib/env";
import { articleAnalysisSchema } from "@/lib/schemas";
import type { ArticleAnalysis } from "@/lib/types";

const openai = createOpenAI({
  apiKey: getOpenAiApiKey(),
});

export async function analyzeArticle(input: {
  title: string;
  articleDescription?: string;
  articleText: string;
  articleUrl: string;
  sourceName?: string;
}): Promise<ArticleAnalysis> {
  const { object } = await generateObject({
    model: openai(getOpenAiModel()),
    schema: articleAnalysisSchema,
    temperature: 0.2,
    maxTokens: 300,
    system: "You analyze news articles and return concise structured output.",
    prompt: `Analyze the following news article content from the API response.

Title: ${input.title}
URL: ${input.articleUrl}
Source: ${input.sourceName?.trim() || "Unknown source"}
Description: ${input.articleDescription?.trim() || "None provided"}

Tasks:
1. Write a concise summary in 3 to 5 sentences.
2. Classify the article's overall sentiment using one of these levels:
   - very_positive: celebratory, breakthrough, overwhelmingly optimistic
   - positive: generally favorable, hopeful, constructive
   - neutral: factual reporting, balanced, no clear lean
   - negative: critical, concerning, pessimistic
   - very_negative: alarming, crisis-level, strongly condemning

Article content:
${input.articleText}`,
  });

  return {
    summary: object.summary.trim(),
    sentiment: object.sentiment,
  };
}
