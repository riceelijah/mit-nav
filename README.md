# MIT Navigator

MIT Navigator gives step-by-step walking directions across MIT, from building to building and floor to floor, with step-free and indoor options. I built it for visitors and new students who don't yet know that 32-123 is in Stata, and signed-in users can also report a blocked passage (which everyone's directions then avoid) and keep favorites, saved trips and preferences.

## Project materials

- [The deployed app](https://mit-nav.mit-sdg.dev)
- [Design document](design/design-document.md), which summarizes how the design changed since P1 and P3
- [Demo video](design/demo.md)
- [Design notes](design/design-notes.md) on the routing and route-line redesign
- [User journey](design/journey.md)
- [Concept specifications](design/concepts/), with the shared types in [design/types.md](design/types.md)
- [Reactions](design/compositions/), which are the compositions that connect the concepts
- [Tests](tests/), with the last run's output in [tests/output.txt](tests/output.txt)

## Build and run locally

You need [Bun](https://bun.sh) and [Podman](https://podman.io), which runs MongoDB in a container.

```sh
bun install
cp .env.example .env   # MONGODB_URL for the container database
bun run db:up          # starts MongoDB in a container
bun run seed           # loads the campus map into the database
bun run dev            # backend on :3000, frontend on :8080
```

Then open http://127.0.0.1:8080 (not localhost, since sign-in expects that exact address). Running `bun run db:reset` empties the database, accounts included.

## Test

```sh
bun test           # on an in-memory MongoDB, with no setup (the first run downloads a MongoDB binary)
bun run test:real  # against the container database, after bun run db:up
bun run check      # specification and type checks
```

## How it works

The campus map is generated rather than drawn by hand, because I found that entering even one building (Simmons, in P2) took too long to ever cover the campus. A converter builds every room, corridor, stair and elevator from MIT's room inventory and MapIT's room positions, joins buildings with OpenStreetMap's footpaths and crosswalks, and traces each floor's hallways from MIT's drawings so the route line follows real corridors. The tradeoff is that the map is only as good as those sources, so a building MapIT has no room positions for gets a route through a single corridor per floor and no floor plan.

## Known limitations

- 58 buildings have no room positions in MapIT, so they get no floor plan.
- A phone can't tell where it is indoors, so steps inside buildings are ticked off by hand.
- MIT's own drawings are shown only to people signed in with MIT's login (MIT Facilities' condition), and they are never committed to this repository.

## Credits

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Room data comes from MIT's room inventory and [MapIT](https://whereis.mit.edu), and floor plans are traced from MIT Facilities' drawings.
