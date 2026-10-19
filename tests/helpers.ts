import { MongoClient, type Db } from "mongodb";
import { createGateway } from "@mit-sdg/sync-engine/boundary";
import { createHttpHandler } from "@mit-sdg/sync-engine-http/handler";
import { assembleApplication } from "../src/assembly.ts";
import { WayfindingConcept } from "../src/concepts/Wayfinding.ts";
import { policy, publicOrigin } from "../src/http.ts";
import { testDatabase } from "./support/reusable/mongo.ts";

/**
 * A fresh, empty database for one test: an in-memory MongoDB by default (no setup needed),
 * or the container database with TEST_MONGO=real.
 */
export async function freshDb(): Promise<{ db: Db; close: () => Promise<void> }> {
  if (process.env.TEST_MONGO !== "real") return { db: await testDatabase(), close: async () => {} };
  const client = new MongoClient(process.env.MONGODB_URL!);
  const db = client.db(`mitnav_test_${crypto.randomUUID().slice(0, 8)}`);
  return { db, close: async () => { await db.dropDatabase(); await client.close(); } };
}

/**
 * The HTTP API on a fresh database, a way to make browsers that each keep their own cookies, and the map
 * (Wayfinding on the same database), which tests fill directly as the seed script does.
 */
export async function freshApi() {
  const { db, close } = await freshDb();
  const application = assembleApplication(db);
  const api = createHttpHandler({ application, gateway: createGateway({ application }), policy });
  const browser = () => {
    const jar = new Map<string, string>();
    return async (path: string, body: object = {}) => {
      const response = await api(
        new Request(`${publicOrigin}/api${path}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: publicOrigin,
            cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
          },
          body: JSON.stringify(body),
        }),
      );
      for (const line of response.headers.getSetCookie()) {
        const [pair] = line.split(";");
        const [name, value] = pair.split("=");
        if (value) jar.set(name, value);
        else jar.delete(name);
      }
      return (await response.json()) as any;
    };
  };
  return { db, close, browser, map: new WayfindingConcept(db) };
}

/** A browser signed up with a password as `username`. */
export async function signedUp(make: () => (path: string, body?: object) => Promise<any>, username: string) {
  const post = make();
  const result = await post("/auth/register", { username, password: "correct horse battery" });
  if (result.error) throw new Error(`sign-up failed: ${result.error}`);
  return post;
}
