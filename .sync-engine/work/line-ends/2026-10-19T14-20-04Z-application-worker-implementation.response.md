## Status
Complete

- web/indoor.ts: walkToward (end at reachable open floor nearest an unreachable place within a distance), snapping to any traced space, ROOM_COST 20, nearestOpen.
- web/app.ts: routeGeometry tracks where the line stands; untraced places met at reachable open floor (15 m) incl. route starts; traced places joined at reachable floor within 4 m with a step through the door; leaving closed-off places from the joining floor; two-building walks in three parts with a crossing of at most 20 m; pass-through corridors merged (falling back to separate walks when no path); walk cache cleared when plans load.
- tests/indoor.test.ts: reachable-end test; room-cost wording.

## Changed
- web/indoor.ts, web/app.ts, tests/indoor.test.ts, tests/output.txt

## Checks
- check passed; bun test 68 pass.
- Browser, Simmons → 32-123: Vassar Street outdoors; Fairchild along 100CA/100CB without doubling back or crossing lab 184; crossing into Stata west lobby; down the street to vestibule 100S1V through its door; into 32-123 by its rear door; destination marked at the hall.
