## Status
Complete

## Changed
- scripts/campus-to-map.ts: corridor networks from MapIT positions (nearest 3 within 40 m, then closest pairs to connect), rooms/elevators/stairs attached to the nearest corridor (unplaced → corridor nearest the floor's corridor centre), metres in directions, indoor cost 0.2 + m/50, OSM entrances (≤ 15 m of outline) choose entry corridors, `floorJoin` (15 m bridge; touching + both corridors ≤ 35 m of the other's outline; hub floors touch rule), single-corridor fallback.
- data/raw/entrances.json (gitignored), data/campus.json regenerated (10,967 places, 18,080 connections, 202 indoor building links).
- tests/converter.test.ts (corridor linking, nearest attachment, unplaced rooms, elevator choice, all join rules incl. refusals); tests/campus.test.ts updated for new instruction text and ground floor.
- web/app.ts: consecutive corridor walks shown as one step with summed metres.

## Questions
None.

## Checks
- `bun test`: 55 pass.
- `bun run check`: source and application checks pass; the generated design document is stale because Campus.md prose changed — regenerating it is a coordinator step after this run.
- Sample routes: 7 → 10-250 indoors via 3 (18 m into 3, stairs, 40 m into 10); Simmons → 32-G904 uses elevator E4 near G9; 32-123 → 26-100 goes outside (32 and 26 corridors don't meet).
