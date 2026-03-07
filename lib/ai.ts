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
  articleText: string;
  articleUrl: string;
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

Tasks:
1. Write a concise summary in 3 to 5 sentences.
2. Classify the article's overall sentiment as positive, neutral, or negative.

Article content:
${input.articleText}`,
  });

  return {
    summary: object.summary.trim(),
    sentiment: object.sentiment,
  };
}
