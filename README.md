# Simmons Hall Navigator

Step-by-step directions inside Simmons Hall, with a step-free option. Anyone can flag a passage (for example an elevator) as blocked, and everyone's directions avoid it until someone marks it clear. See `design/` for the concept and composition specs.

## Run it

```sh
bun install
bun run dev        # starts MongoDB (podman), backend :3000, frontend :8080
bun run seed       # in a second terminal, once, to load the map
```

Open http://127.0.0.1:8080. `bun test` runs the tests, and `bun run db:reset` empties the database.

## Core user journey

See `design/journey.md`.
