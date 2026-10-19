## Status
Blocked

- Implemented corridor-following lines, but in the browser the approved walkable set (traced circulation + two places) left gaps: corridors carved up by nearest-label splits, unlabelled corridor stretches, doorway slivers. Fixes needed design changes: tracing by closing (not growth) of walls, shared spaces split by area-quota growth from labels, unlabelled open floor kept as walkable, spaces grown back into doorways, and other traced rooms walkable at 4x cost.

## Changed
- scripts/fit-drawings.py, scripts/campus-to-map.ts, web/indoor.ts, web/app.ts, tests/indoor.test.ts

## Questions
- Design update needed for the above (coordinator to revise Campus.md and re-review).

## Checks
- tsc passed; indoor test passes; Fairchild line follows corridors in the browser.
