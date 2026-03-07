import { MongoClient, type Collection, type Db } from "mongodb";

import { getMongoDatabaseName, getMongoUri } from "@/lib/env";
import type { AnalysisDocument } from "@/lib/types";

declare global {
  var __smartReviewerMongoClientPromise: Promise<MongoClient> | undefined;
  var __smartReviewerIndexesPromise: Promise<void> | undefined;
}

async function createClient(): Promise<MongoClient> {
  const client = new MongoClient(getMongoUri(), {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 10_000,
  });
  return client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  globalThis.__smartReviewerMongoClientPromise ??= createClient();
  return globalThis.__smartReviewerMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getMongoDatabaseName());
}

export async function getAnalysesCollection(): Promise<
  Collection<AnalysisDocument>
> {
  const database = await getDatabase();
  return database.collection<AnalysisDocument>("analyses");
}

/**
 * Ensure required indexes exist. Cached behind a global promise so it
 * runs exactly once per process lifetime — subsequent calls resolve
 * instantly without a network round trip.
 */
export function ensureIndexes(): Promise<void> {
  globalThis.__smartReviewerIndexesPromise ??= (async () => {
    const collection = await getAnalysesCollection();
    await Promise.all([
      collection.createIndex({ status: 1, createdAt: -1 }),
      collection.createIndex({ status: 1, sentiment: 1, createdAt: -1 }),
    ]);
  })();

  return globalThis.__smartReviewerIndexesPromise;
}
