## Status
Complete

Implemented the approved Campus design and the campus converter.

## Changed
- src/compositions/Simmons.ts → src/compositions/Campus.ts (+ ClearingResolvesSharedReports); src/assembly.ts; generated.config.ts; generated/ (mit-campus-navigation.md, wire.ts)
- src/concepts/Wayfinding.ts: `_sameService`; binary-heap Dijkstra keyed by (distance, discovery order)
- scripts/campus-to-map.ts (new, `bun run campus`), scripts/seed.ts (loads Simmons + campus), data/campus.json (generated), .gitignore (data/raw/)
- tests/campus.test.ts (converter, _sameService, shared report resolution over HTTP, campus-scale route around a flagged Stata elevator)
- web/app.ts, web/index.html: campus wording, picker sorted by name and capped at 40 with a "type to narrow" hint, connections panel rendered only when open, default destination 32-123
- README.md, AGENTS.md, package.json

## Questions
None.

## Checks
- `bun run generate`; `bun run check`: concept source check passed for 2 concepts; application check passed with 7 advisories; tsc clean.
- `bun test`: 13 pass, 0 fail.
- Local app: fresh Mongo, seeded 3678 places / 7195 connections in 16 s; journey Simmons lobby → 32-123 renders 7 steps; picker finds 32-G904.
- Known: overview answer is 2.2 MB and takes ~4 s at this size.
