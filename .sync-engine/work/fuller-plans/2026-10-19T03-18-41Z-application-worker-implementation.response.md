## Status
Complete

## Changed
- scripts/campus-to-map.ts: interior collects every positioned inventory room (`drawn`); writes web/plans/<building>.json (outline + floors with level and rooms: number, use, position, area); outlines.json and place area removed.
- src: Wayfinding `_onFloor` and place area removed; Campus FloorPlan/ShowFloor removed, AddPlace without area; inputs.ts floorInput removed; generated/ regenerated.
- web/server.ts: /plans/:file (validated name, cached); web/app.ts: roomShapes (nearest-label regions capped at a 1.5× area square on the outline axis), plan fills by use, plans at zoom 18+ for route buildings in view, floor switcher on the map (plan-file floors, route floors marked, opens on current step floor, follows the current step), panel "See building" buttons with a single setView; web/styles.css switcher.
- web/plans/*.json (55 files, 1.4 MB); tests updated (removed floor tests, converter drawn-room assertion).

## Questions
None.

## Checks
- generate; check; `bun test` 58 pass. Browser: See building 32 shows Stata floor 1 with the switcher; zoomed in, rooms read with labels under the route.
