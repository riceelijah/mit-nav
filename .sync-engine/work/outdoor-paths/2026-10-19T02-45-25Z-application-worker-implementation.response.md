## Status
Complete

## Changed
- scripts/campus-to-map.ts: OSM path network (junctions, ends, bends > 30°; largest component; steps/wheelchair=no not step-free), buildings joined at entrances (≤ 80 m) with straight-walk fallback, building places at main entrance, entry links cost the walk to the main entrance, Simmons generated like every building, web/outlines.json written; dead outdoorPairs removed.
- Retired data/simmons.json, data/simmons.floorplan.json, scripts/floorplan-to-map.ts; scripts/seed.ts loads campus.json only; package.json drops `floorplan`.
- src/concepts/Wayfinding.ts `_onFloor`; src/compositions/Campus.ts FloorPlan + ShowFloor (/map/floor, floorInput validator); generated/ regenerated.
- web/app.ts: mergeSteps (corridor and outdoor runs, street names, crosswalks), path points hidden from arrivals, floor plans (half-plane Voronoi cells clipped to outline, borrowed positions drawn only as corridors, labels at zoom ≥ 19), default start Simmons Hall; web/styles.css; web/outlines.json.
- data/raw/W79.csv, paths.json (gitignored); data/campus.json regenerated (15,955 places, 21,634 connections, 55 interiors).
- tests: path network, _onFloor, floor endpoint, campus test without the Simmons map.

## Questions
None.

## Checks
- generate; check (28 advisories); tsc clean; `bun test` 58 pass.
- Browser: 10-250 → 32-123 stays indoors via 4, 8, 16, 26, 36; Stata floor 1 plan draws with destination highlighted.
