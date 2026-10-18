import { MongoClient } from "mongodb";
import { httpWire } from "@mit-sdg/sync-engine-http/tooling";
import { assembleApplication } from "./src/assembly.ts";
import { policy } from "./src/http.ts";

export default {
  // Checks read only the assembly's shape; this client never connects, and Commons is in memory.
  assemble: () => assembleApplication(new MongoClient("mongodb://localhost").db("mitnav")),
  title: "MIT Campus Navigation",
  wireName: "CampusWire",
  design: {
    version: 1,
    documents: [
      new URL("./design/types.md", import.meta.url),
      new URL("./design/compositions/Campus.md", import.meta.url),
      new URL("./design/compositions/Saved.md", import.meta.url),
      new URL("./design/compositions/Accounts.md", import.meta.url),
      new URL("./design/compositions/Passwords.md", import.meta.url),
      new URL("./design/compositions/Commons.md", import.meta.url),
    ],
  },
  projections: [httpWire({ policy, name: "CampusWireHttp" })],
};
