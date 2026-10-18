## Status
Complete

## Changed
- src/concepts/Wayfinding.ts: positions on places, addPlace takes them, `_route` kind/latitude/longitude, `_place`/`_search` positions, `_nearest` (ground metres, earliest on tie, off-Earth → none), `groundMeters`.
- src/compositions/Campus.ts: Nearest former, NearestPlace endpoint (numbers validator), Route/PlaceSearch positions, AddPlace positions; src/compositions/inputs.ts `numbers`.
- scripts/campus-to-map.ts (positions from building centres), scripts/seed.ts (Simmons places take Simmons Hall's position); data/campus.json regenerated (54 interiors).
- web/index.html (Leaflet 1.9.4 from unpkg), web/app.ts (map, opt-in tracking with 40 m reach, Done button, off-course 75 m ×2 reroute with reset, preference turns tracking on), web/styles.css.
- tests: positions in addPlace calls; `_nearest` and route/search/nearest endpoint tests; tests/output.txt.

## Questions
None.

## Checks
- generate; check (27 advisories); tsc clean; `bun test` 53 pass.
- Browser with mocked geolocation: reading at New Vassar ticks steps 1–2 and highlights 3; one off-course reading does nothing, two reroute from Wiesner (E15) to 32-123; map draws route, start, end and position.
