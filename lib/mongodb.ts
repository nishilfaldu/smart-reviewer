import { MongoClient, type Collection, type Db } from "mongodb";

import { getMongoDatabaseName, getMongoUri } from "@/lib/env";
import type { AnalysisDocument } from "@/lib/types";

declare global {
  var __smartReviewerMongoClientPromise: Promise<MongoClient> | undefined;
  var __smartReviewerAnalysesCollectionPromise:
    | Promise<Collection<AnalysisDocument>>
    | undefined;
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
  globalThis.__smartReviewerAnalysesCollectionPromise ??= (async () => {
    const database = await getDatabase();
    const collection = database.collection<AnalysisDocument>("analyses");

    await Promise.all([
      collection.createIndex({ status: 1, createdAt: -1 }),
      collection.createIndex({ articleUrl: 1 }, { unique: true }),
    ]);

    return collection;
  })();

  return globalThis.__smartReviewerAnalysesCollectionPromise;
}
