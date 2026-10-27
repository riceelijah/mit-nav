# MIT Navigator

Step-by-step walking directions across MIT, from building to building and floor to floor, with step-free and indoor options. Signed-in users can report blocked passages, which everyone's directions then avoid, and keep favorites, saved trips and preferences.

## Project materials

- Deployed app: https://mit-nav.mit-sdg.dev
- Design document: [design/design-document.md](design/design-document.md)
- Demo video: [design/demo.md](design/demo.md)
- Design notes: [DESIGN-NOTES.md](DESIGN-NOTES.md)
- User journey: [design/journey.md](design/journey.md)
- Concept specifications: [design/concepts/](design/concepts/), with shared types in [design/types.md](design/types.md)
- Reactions (compositions): [design/compositions/](design/compositions/)
- Tests: [tests/](tests/), with the last run's output in [tests/output.txt](tests/output.txt)

## Build and run locally

Needs [Bun](https://bun.sh) and [Podman](https://podman.io) (for MongoDB).

```sh
bun install
cp .env.example .env   # MONGODB_URL for the container database
bun run db:up      # starts MongoDB in a container
bun run seed       # loads the campus map into the database
bun run dev        # backend on :3000, frontend on :8080
```

Open http://127.0.0.1:8080. To empty the database, accounts included, run `bun run db:reset`.

## Test

```sh
bun test           # on an in-memory MongoDB; no setup (the first run downloads a MongoDB binary)
bun run test:real  # against the container database, after bun run db:up
bun run check      # specification and type checks
```
