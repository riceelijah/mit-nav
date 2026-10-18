## Status
Complete

## Changed
- Copied from ConceptBox: src/concepts/{Registering,Sessioning,Authenticating,Federating}/, src/compositions/{Accounts,Passwords,Commons}.ts, src/compositions/inputs.ts (plus `signedIn` validator), tests/concepts/*, tests/support/reusable/*.
- New: src/concepts/{Favoriting,Planning,Journaling,Preferring}.ts, src/compositions/Saved.ts, tests/saved.test.ts, tests/output.txt.
- src/concepts.ts (all concepts with mongo floors), src/assembly.ts (implementations("mongo"), MemoryProvider default, redaction), src/http.ts (PUBLIC_ORIGIN, cookies, refusal categories), src/main.ts (CommonsProvider), src/concepts/Wayfinding.ts (`_place`, step `distance`), src/compositions/Campus.ts (session-guarded flag/clear, reporter username via whether), generated/, generated.config.ts.
- tests/helpers.ts (mongodb-memory-server, cookie-keeping browser), tests/app.test.ts (journey with accounts, sign-in, saved-things authorization), tests/campus.test.ts.
- web/app.ts (sign-in incl. Commons callback, account panels, finish trip, distance estimate), web/styles.css, web/server.ts (/auth/commons/callback), web/index.html (no-referrer).
- package.json/bun.lock (dev: mongodb-memory-server 11.2.0), README.md, AGENTS.md.

## Questions
None.

## Checks
- generate; check (10 concepts, 26 advisories); tsc clean; `bun test` 51 pass.
- Browser (local): password sign-up, favorite, save trip, finish trip, history and totals verified. Commons sign-in not exercised live (needs a Commons approval); covered by ConceptBox's Federating and CommonsProvider tests.
