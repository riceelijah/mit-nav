import { assemble } from "@mit-sdg/sync-engine/assembly";
import type { Db } from "mongodb";
import { composition as campus } from "./compositions/Campus.ts";
import { composition as saved } from "./compositions/Saved.ts";
import { composition as accounts } from "./compositions/Accounts.ts";
import { composition as passwords } from "./compositions/Passwords.ts";
import { composition as commons } from "./compositions/Commons.ts";
import { applicationConceptSet } from "./concepts.ts";
import { MemoryProvider, type Provider } from "./concepts/Federating/provider.ts";
import { db } from "./db.ts";

/** The app on a database and a Commons provider (a MemoryProvider stands in for Commons in tests and checks). */
export function assembleApplication(database: Db = db, commonsProvider: Provider = new MemoryProvider()) {
  return assemble({
    conceptSet: applicationConceptSet,
    instances: applicationConceptSet.implementations("mongo", { database, commons: commonsProvider }),
    composition: { Campus: campus, Saved: saved, Accounts: accounts, Passwords: passwords, Commons: commons },
    // A Commons sign-in attempt works like a password until it is spent, so it and the values sent with it are redacted from logs.
    redaction: { fields: ["attempt", "nonce", "state", "code", "password", "session"] },
    // Print what went wrong. Otherwise a failure only shows up as INTERNAL_ERROR.
    rawFaultReporter: ({ error }) => console.error(error),
  });
}
