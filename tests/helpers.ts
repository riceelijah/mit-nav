import { MongoClient, type Db } from "mongodb";

// Minimal in-memory stand-in for the few Mongo operations the concepts use.
// It lets `bun test` run without a container. Set TEST_MONGO=real to use the real database instead.
function matches(doc: any, filter: any): boolean {
  return Object.entries(filter).every(([key, want]: [string, any]) =>
    want && typeof want === "object" && "$in" in want ? want.$in.includes(doc[key]) : doc[key] === want,
  );
}

class FakeCollection {
  docs: any[] = [];
  private uniques: string[] = [];
  async createIndex(spec: Record<string, number>, options?: { unique?: boolean }) {
    if (options?.unique) this.uniques.push(...Object.keys(spec));
    return "ok";
  }
  async insertOne(doc: any) {
    for (const key of this.uniques) {
      if (this.docs.some((d) => d[key] === doc[key])) {
        const { MongoServerError } = await import("mongodb");
        throw new MongoServerError({ message: "duplicate", code: 11000 });
      }
    }
    this.docs.push(structuredClone(doc));
    return { acknowledged: true };
  }
  find(filter: any = {}) {
    const rows = this.docs.filter((d) => matches(d, filter)).map((d) => structuredClone(d));
    return { toArray: async () => rows };
  }
  async findOne(filter: any) {
    const found = this.docs.find((d) => matches(d, filter));
    return found ? structuredClone(found) : null;
  }
  async countDocuments(filter: any = {}) {
    return this.docs.filter((d) => matches(d, filter)).length;
  }
  async updateOne(filter: any, update: any) {
    const found = this.docs.find((d) => matches(d, filter));
    if (found) Object.assign(found, update.$set);
    return { matchedCount: found ? 1 : 0 };
  }
  async updateMany(filter: any, update: any) {
    for (const d of this.docs.filter((x) => matches(x, filter))) Object.assign(d, update.$set);
    return { acknowledged: true };
  }
}

export function fakeDb(): Db {
  const collections = new Map<string, FakeCollection>();
  return {
    collection: (name: string) => {
      if (!collections.has(name)) collections.set(name, new FakeCollection());
      return collections.get(name)!;
    },
  } as unknown as Db;
}

/** A fresh, empty database for one test. */
export async function freshDb(): Promise<{ db: Db; close: () => Promise<void> }> {
  if (process.env.TEST_MONGO !== "real") return { db: fakeDb(), close: async () => {} };
  const client = new MongoClient(process.env.MONGODB_URL!);
  const db = client.db(`simmons_test_${crypto.randomUUID().slice(0, 8)}`);
  return { db, close: async () => { await db.dropDatabase(); await client.close(); } };
}
