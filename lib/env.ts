function readEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getGNewsApiKey(): string {
  return readEnv("GNEWS_API_KEY");
}

export function getMongoUri(): string {
  return readEnv("MONGODB_URI");
}

export function getMongoDatabaseName(): string {
  return process.env.MONGODB_DB?.trim() || "smart-reviewer";
}

export function getOpenAiApiKey(): string {
  return readEnv("OPENAI_API_KEY");
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
}
