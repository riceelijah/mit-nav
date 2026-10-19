## Status
Complete

## Changed
- scripts/campus-to-map.ts: path segments cost metres/50; data/campus.json regenerated.
- src/concepts/Wayfinding.ts: shared `cheapest()` search for `_route` and new `_closest` (≤ 5, cost order, stops at the fifth match); src/concepts/Preferring.ts: units (METERS default, also for older records).
- src/compositions: Campus Closest/FindClosest (/route/closest, closestInput), Saved SetPreferences/MyPreferences with units (preferencesInput); generated/ regenerated.
- web/: map-first redesign (desktop panel, phone bottom sheet with peek, destination plaque, tabs, sign-in dialog, Barlow, palette), nearest buttons with real route metres, units everywhere (device-kept when signed out), distance = sum of written metres, auto-scroll after Done, progress on the map (walked grey, current on signage yellow, rest cardinal).
- tests: units, _closest, closest endpoint; tests/output.txt.

## Questions
None.

## Checks
- generate; check (29 advisories); tsc clean; `bun test` 60 pass.
- Browser: desktop and 375 px layouts; Simmons → 32-123 shows 1.1 km (was 2.6); nearest restroom from Simmons lists W79-152 (13 m) first; Done scrolls to the next step and the map splits the line.
