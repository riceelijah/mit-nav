# Indoor routing and the route line: diagnosis and a unified model

## What is wrong today

The route and its drawn line come from two models that never see each other.

- **The route** (`src/concepts/Wayfinding.ts`) is Dijkstra over the graph `scripts/campus-to-map.ts` builds. Its indoor nodes are the *label points* of corridors and lobbies from MIT's room inventory; two corridors are joined when their labels are within 40 m (`CORRIDOR_REACH`), rooms attach to their nearest label, stairs and elevators are links between labels on different floors.
- **The line** (`web/app.ts` `routeGeometry`/`computeWalk`, `web/indoor.ts` `walkToward`) tries, at draw time, to join each pair of consecutive route places by a grid search over the traced outlines in `web/plans/*.json`.

The graph's connectivity is label distance; the line's connectivity is traced open floor. Wherever they disagree, the page has nothing to draw and falls back to a straight line, or to one of the special cases (`UNTRACED_REACH`, `JOIN`, `CROSSING`, `NEAR_JOIN`, three-part walks, pass-through merging, recovered outlines). Each of those is a patch over one disagreement.

### Reproduced (routes from the running backend, walks replayed headless over the plan files)

Script: the same logic as `computeWalk`, run outside the browser, so each walk can say *why* it failed. Numbers are from the current `data/campus.json` and `web/plans/`.

| Route | Walk | What the page does | Why |
|---|---|---|---|
| Simmons (W79) → 32-123 | 36-100LA → 36-100CA | straight line through Building 36 | the traced lobby and corridor are 22.6 m apart as open floor; the graph joined the labels (32 m apart) anyway |
| Simmons → 32-123 | 32-100S1V → 32-123 | straight line into the hall | 32-123 is a seated hall with no outline; the open floor the search reaches stops 15.2 m short, just outside `UNTRACED_REACH` = 15 |
| 7A → 10-250 (Indoors) | 3-100CA → 3-100LA | straight line | 3-100CA has no traced outline at all and its label is more than 4 m (`JOIN`) from any open floor; the reachable floor ends 13.5 m away |
| 7A → 10-250 | 3-100LA → 3-200LA | straight line between two labels on different floors | stairs are not places: the link runs label to label, so the line jumps floors in the middle of the lobby (the per-floor filter hides half of it; the badge sits where the lobby label is, not at the stairs) |
| 1-190 → 10-250 | 1-200CB → 1-200CA | straight line | open floor reached ends 16.1 m short (an untraced stretch between the two corridor pieces) |
| 32-123 → 10-250 | 26-100CA → 26-100LA | straight line | 29.7 m of untraced floor between the pieces |
| 32-123 → 10-250 | 32-100S1V → 32-100LA | straight line | same island as above, the other way |

Every failure is the same failure: **the graph says two places connect, the geometry says they don't**, and the page only finds out while drawing. The converter never checks that the traced floor joins the corridors it links, and the page cannot change the route, so it draws through the wall.

Secondary problems with the same root:

- **Zigzags.** Each walk starts where the previous walk ended (`drawn`/`joined`) and ends at a *label point* that is often beside, not on, the corridor; the line visits each label, so a straight corridor with three labels is drawn as a shallow zigzag. Pass-through merging (`passesThrough`) papers over this for corridors only, and only when the merged walk fits the 40 m search margin.
- **Detours.** Link costs are label-to-label straight distances (`indoorWalk(meters)`), not walked distances, so a route can prefer a hop whose straight distance is short but whose corridor path is long, and the line then shows the long way. The step text ("Walk about 32 m") is also the straight distance.
- **Slow redraws.** A single grid search is 1–40 ms (the 36→32 crossing is 37 ms), so a route is ~50 ms of search. What makes it feel slow is that it is *repeated*: `drawProgress` reruns `routeGeometry(true)` on every change of `doneCount`, `shownFloor`, `visiblePlans` and every plan file arrival, with a cache (`walks`) keyed by JSON of four values that is invalidated by plan loads. Nothing is computed ahead of time.
- **The off-course check** measures against the straight lines between labels, because the drawn path is not trustworthy.

## Proposal: one model, built at conversion time

Make the geometry part of the map, not of the page.

### Principle

A connection is a walk, and a walk has a path. The converter already knows the traced floors (`tracedOutlines`) and the label positions, and `web/indoor.ts` is a plain module it can import. So:

1. **Each indoor link carries its path** – the corner points of the walk between its two places, found once at conversion time by the same grid search the page runs today. Its *distance* is the length of that path, not the label-to-label line. A link whose two ends the traced floor does not join is **not made** (unless the gap is short and bridged on purpose, see below), so the graph's connectivity *is* the traced connectivity.
2. **Stairs and elevators are places** (TRANSIT, at their inventory position on each floor). A walk to the stairs is an ordinary corridor link with a path; the flight is a vertical link with no path. The floor change therefore happens *at the stairs*, which is where the badge goes and where the per-floor filter cuts the line.
3. **The page draws `steps.flatMap(s => s.path)`.** No search, no fallbacks, no plan-file dependency for the line, no cache. The off-course check can measure against the real line.

`Wayfinding` keeps its Dijkstra, blocking, closing hours, step-free and the indoors factor unchanged; only `Link` gains a `path` and `_route` reports it. The route and the line are then the same object.

### Why link paths and not a navigation mesh in the plan files

A per-floor mesh or visibility graph would be the "right" general structure, but it would be a second routing engine (in the page, or a second one in Wayfinding) with its own blocking and preferences, and it would move the plan files from "drawing data" to "routing data". Precomputed link paths keep **one** routing engine, **one** set of rules (blocked, closed, accessible, outdoor factor), and make the plan files purely for drawing. They also cost nothing at request time. The price is that geometry is frozen at conversion; that is already true of everything else in the map.

### How the pieces fit

- **Rooms.** A room's link to its corridor gets a path from the corridor label into the room through the grown doorway; a room without an outline (seated hall) ends its path at the open floor nearest it, like today's `UNTRACED_REACH`, but decided once, at conversion, with the gap recorded in the distance.
- **Corridors.** Labels that sit beside the corridor are snapped to the nearest open floor before paths are searched, so the line runs along the corridor, not label to label. Corridors in one connected piece of open floor are joined by their real walked distance; corridors in different pieces are joined only when the gap between the pieces is under a short bridging distance (a doorway or vestibule the drawing does not show as open floor), with a straight segment across the gap.
- **Building joins.** `floorJoin`/`tracedMeeting` already find where two buildings' traced spaces meet; the join link's path is corridor → meeting point → corridor, each half searched in its own building's floor. Buildings with no traced floor keep straight links as now.
- **Stairs, elevators, step-free.** Vertical links are unchanged except that they now join landing places instead of corridor labels; `accessible` and `service` stay on them, so blocking an elevator and step-free routing work exactly as before.
- **Indoors preference, blocking, closing hours.** Untouched: they are properties of links, and links are still what is routed over.
- **Untraced buildings and floors.** Exactly today's graph (labels joined by distance, straight paths). The converter reports how many indoor links have a path, so coverage is visible.
- **Size.** `data/campus.json` is 5.1 MB with 25.6 k links. A path is a handful of corners; at ~20 bytes a corner the paths add about 1–2 MB. The 50 MB deploy limit is not near. The paths could also be dropped from `_route`'s wire format and fetched per building like plans, if that ever mattered.
- **Conversion time.** ~20 k grid searches at a few ms each is a minute or two, once, at `bun run campus`.
- **Costs.** `distance` becomes `indoorWalk(path length)`, so routes stop preferring links that are short as the crow flies but long on foot, and the "Walk about N m" text matches the line.

### What the page loses

`computeWalk`, `indoorWalk`, `closestApproach`, `passesThrough`, `untraced`, `spaces`, `tracedFloor`, the `walks` cache, the plan-load redraw, and the constants `UNTRACED_REACH`, `JOIN`, `CROSSING`, `NEAR_JOIN`. `web/indoor.ts` stays, used by the converter and its tests.

## Prototype on this branch

Built (design first, then code; `bun run check:design`, `bun run generate`, `bun run check` and `bun test` pass, 70 tests):

- `design/concepts/Wayfinding.md`: a link has a `path` String ("lat,lon lat,lon …", empty = straight); `connect` takes it; `_route` reports each step's path in the direction walked. `design/compositions/Campus.md`: the route-line paragraph now describes paths found at conversion instead of the page's search.
- `scripts/campus-to-map.ts` `withPaths`: after the map and plan files are built, snaps corridor labels onto open floor (6 m), traces every indoor link on a traced floor with `walkToward` (same rules as before: circulation, lounges, open floor and the link's own rooms at cost 1, other rooms ×20; seated halls met within 15 m then straight to the label; building joins walked in each building with a crossing ≤ 20 m), and rewrites the link's distance and "about N m" from the path length. Runs in ~8 s. Result on the current plans: **11 822 links traced, 787 on traced floors stay straight** (the floor does not join them); `data/campus.json` grows 5.4 → 7.3 MB.
- `src/concepts/Wayfinding.ts`, `scripts/seed.ts`, `src/compositions/Campus.ts`: store, seed and report `path`.
- `web/app.ts`: `routeGeometry` is now 15 lines — each step's path, then its place. Deleted: `computeWalk`, `indoorWalk`, `closestApproach`, `passesThrough`, `untraced`, `spaces`, `tracedFloor`, the `walks` cache, the plan-load redraw and the four constants. Plan files are now only for drawing. Floor badges and the per-floor filter are unchanged.
- Verified with the four routes against a seeded copy of the new map (separate database): every step carries a path except the known islands, and the page draws them (checked in the browser for Simmons → 32-123 at Stata).

### Second round (same branch)

- **Walkable floor = outline minus rooms.** Tracing corridors from the drawings' ink leaves holes (787 unjoined links at first). Rooms are the reliable data (position + area, mostly rectangles), so `withPaths` now passes the building outline as a base tier to `walkToward`: everything inside it is walkable at cost 1 except the rooms (traced shape, or the schematic rectangle `roomShapes` draws, moved to `web/shapes.ts` so the converter shares it), fattened by one cell so the cracks between rectangles close. Traced corridors and open floor still override on top. Unjoined links: 787 → 316; traced: 11 822 → 15 189 (floors with positions but no tracing now count).
- **Stairs and elevators are places.** Each stop/landing is a TRANSIT place at its inventory position, reached by a walk link with a path; rides and flights join landings (`accessible`, `service` unchanged). `web/steps.ts` shows walk + ride + step-off as one step with the old wording, flagged by the ride. Floor badges now sit on the stairs.
- **Audit.** `bun scripts/audit-paths.ts [building…]` samples every traced path each half metre and reports those running more than 3 m through rooms, worst first and per building. It found three systemic bugs, all fixed:
  1. Corner pruning allowed a shortcut through any cell no costlier than the walk's *endpoints*; an endpoint under a neighbour's rectangle licensed straight cuts through every room between. Now a shortcut may cross only open floor or cells the found path used.
  2. Cross-building joins ended "at the reached floor nearest the other building", which with the outline walkable was a point on the party wall inside a room; the entry on the other side likewise. Now a walk may only end on open floor, and the second half is searched backwards from its place.
  3. `PVT CIRCULATION` (a suite's private corridor) was costed as a room.
- **What the audit still flags (3 908 of 15 189):** mostly tracing quality, not routing: a corridor label inside a room's traced shape (31-200LC in office 230), corridors swallowed into a room's trace, big labs that really are the way through (31-255), inner offices only reachable through a suite. The per-building table tells where retracing pays most (31, 13, E15, 45, 68).

### Third round

- **Building joins are one search** over both floors with a 3 m strip between the two places (the halves-and-crossing logic is gone; it aimed each half at a sliver between schematic rectangles and cut through rooms to get there).
- **Schematic rooms are squares** of their inventory area, turned to the building's axis (`web/shapes.ts`, shared by page and converter), instead of Voronoi regions clipped to 1.5× the area. Crisper, and routing sees the same shapes it draws.
- **Newer tracing merged in:** the main checkout's re-traced outlines (`data/raw/drawings/outlines`, 16:19–17:03 on 2026-10-19, after the last commit on main) regenerated 37 plan files. Audit: 3 821 of 15 219 flagged; 286 unjoined.

### Fourth round

- **Every mapped entrance is a place.** A building was one node at its main door, joined to the paths at each door, so the line crossed the building to the main door (Walker Memorial from the Infinite Corridor). Other entrances are now pass-through places at the door, joined outside to the nearest path point and inside to the nearest ground-floor corridor (+70 places).
- **Traced outlines are tidied** on the way into the plan files (Douglas–Peucker, 0.4 m): the doorway notches and tracing jitter go, plans drop 7.9 → 6.8 MB. The arrow-shaped slivers between rooms (Building 50 basement, 038D/030D) are tracer mis-assignments and need work in `scripts/fit-drawings.py`, a separate task.

Still open:

1. **Entrance links** ("Go inside … to floor 1") have no path: the walk from the door to the entry corridor is straight.
2. **The 316 unjoined links** keep their straight line. Bridge short gaps, then drop what the floor does not join.
3. **Corridor labels on untraced floors** are not snapped out of room rectangles (snapping needs traced open floor to snap to).
4. **Off-course check** could now measure against the drawn line; left as is.
5. **Wire size.** `path` rides on every `_route` step (a few KB per route). Fine today.
