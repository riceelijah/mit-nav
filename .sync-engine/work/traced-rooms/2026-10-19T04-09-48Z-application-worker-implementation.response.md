## Status
Complete

- scripts/fit-drawings.py traces room outlines per fitted floor (walls grown to close doorways, small marks ignored, room space from the ring around each plan position, shared spaces split by nearest position, size checks, elevators and stairways never traced) into data/raw/drawings/outlines/<building>.json, replacing that floor each run; the fit now refits once without outlier matches.
- scripts/campus-to-map.ts tracedOutlines(): local outlines, else the outlines the committed plan file already has; plan rooms carry `s`.
- web/app.ts draws `s` when present, over untraced neighbours; wording updated.

## Changed
- scripts/fit-drawings.py, scripts/campus-to-map.ts, web/app.ts, web/plans/*.json, tests/output.txt

## Checks
- bun run check passed; bun test 65 pass.
- 34 floors fitted (median 0.1–0.3 m); 1551 rooms traced. Overlay of committed outlines on Building 10 floor 1's PDF lies on its walls; Stata floor 1 schematic shows traced rooms in the browser.
