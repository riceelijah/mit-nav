import { type Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

let shared: Promise<MongoClient> | undefined;
let databases = 0;

async function connect() {
  const server = await MongoMemoryServer.create();
  return new MongoClient(server.getUri()).connect();
}

/** A fresh, empty database on one in-memory MongoDB shared by the test run. */
export async function testDatabase(): Promise<Db> {
  shared ??= connect();
  const client = await shared;
  databases += 1;
  return client.db(`test-${databases}`);
}
