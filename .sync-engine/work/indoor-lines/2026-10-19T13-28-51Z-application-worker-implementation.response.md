## Status
Complete

- web/indoor.ts: weighted grid path (corridors, lobbies, bridges, open floor, end places cost 1; other traced rooms 4; recovered outlines only as ends); app.ts draws indoor walks with it, fetches all route plans on a route and redraws whenever a plan loads; off-course still uses straight lines.
- fit-drawings.py: closing instead of growth for doorways; area-quota growth split of shared spaces; spaces grown back into doorways; unlabelled open floor (>= 4 m², not at the margin edge); bounded spaces and open floor cut to the building outline; recovered rooms marked under "!".
- campus-to-map.ts: plan floors carry `open`, rooms carry `f` for recovered; both kept when regenerating without local outlines.
- README updated.

## Changed
- web/indoor.ts, web/app.ts, scripts/fit-drawings.py, scripts/campus-to-map.ts, web/plans/*.json, tests/indoor.test.ts, tests/output.txt, README.md

## Checks
- check passed; bun test 67 pass.
- 2250 traced rooms (was 1558; no floor lower), 510 open-floor pieces, 18 recovered.
- Browser: Simmons → 32-123 line follows Fairchild's lobby and central corridor and Stata's street; the last walk into 32-123 stays straight (seated hall untraced).
