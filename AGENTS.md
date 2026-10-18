## Running the app

- `bun run dev` starts MongoDB in a container, then the backend at http://127.0.0.1:3000 and the frontend at http://127.0.0.1:8080, both in watch mode.
- `bun run seed` fills an empty database with the Simmons Hall map and the campus map (edit `data/simmons.floorplan.json` and run `bun run floorplan` for Simmons; add room lists under `data/raw/rooms/` and run `bun run campus` for the campus; then `bun run db:reset` and seed again).
- `bun test` runs the tests on an in-memory MongoDB (mongodb-memory-server; no container needed). `bun run test:real` runs them against the container database (run `bun run db:up` first).
- `bun run up` runs all three in containers. `bun run down` stops them, and `bun run db:reset` deletes the local data.
- Change `design/` before the code. Check it with `bun run check:design`, then run `bun run generate` and `bun run check`.
- Concepts: `Wayfinding` (places, connections, blocking, routing, search), `Reporting` (who reported what), `Favoriting`, `Planning` (saved trips), `Journaling` (finished trips and totals), `Preferring`, and, copied from ConceptBox, `Registering`, `Authenticating`, `Sessioning`, `Federating` (as `CommonsFederating`). They never call each other; the compositions in `src/compositions/` connect them.
- Sign-in: passwords and Commons class accounts. Set `PUBLIC_ORIGIN` to the address people open (default http://127.0.0.1:8080, so open that, not localhost); `COMMONS_ORIGIN` defaults to https://class.mit-sdg.dev.
