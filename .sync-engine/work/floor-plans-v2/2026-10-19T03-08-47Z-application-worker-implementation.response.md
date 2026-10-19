## Status
Complete

## Changed
- Place area: Wayfinding state/addPlace/_onFloor, Campus AddPlace/FloorPlan, converter (SQ FT × 0.0929; 0 unknown), data/campus.json, tests (area: 0 on fixtures; converter area assertion).
- web/app.ts: planShapes (hallway strokes to 3 nearest corridors within 40 m, room squares of real area aligned to the outline's longest edge, markers without area, shared positions corridor-only), plans in their own panes under the route, automatic plans at zoom 18+ for route buildings in view, chosen plans persist; map zoom to 22 with tile overzoom.

## Questions
None.

## Checks
- generate; check; `bun test` 61 pass. Browser: Stata floor 1 plan draws under the route line.
