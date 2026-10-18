Objective: implement the approved campus design and the converter.
- src: rename composition Simmons → Campus (src/compositions/Campus.ts, assembly, generated.config.ts); add Wayfinding._sameService; add reaction ClearingResolvesSharedReports; replace the O(n^2) Dijkstra selection with a binary heap keyed by (distance, discovery order) so ties still favour earlier connections.
- scripts/campus-to-map.ts (new, `bun run campus`): room inventory CSVs + OSM footprints → data/campus.json; scripts/seed.ts loads data/simmons.json then data/campus.json with shared ids.
- tests: converter unit test, _sameService + shared-report resolution, campus-scale routing.
- web: campus title/wording; picker shows at most 50 matches; connections panel only renders when opened.
- README/AGENTS: run instructions.
Checks: bun run generate, bun run check, bun test.
