# Floor plans that read like plans, under the route, shown when zoomed in

## Goal

Replace the nearest-label cells (which look like shards) with a schematic drawn from what is known: corridors as hallway strokes between corridor positions, rooms as boxes of their real area at their positions aligned to the building's main axis, inside the outline. Plans sit under the route line, and zooming in along a route shows the plans of the buildings in view on the floors the route uses there.

## Scope

- Included: a place's floor area (square metres, 0 when unknown) from the room inventory's square feet; `_onFloor` answers it; converter and seed supply it; page drawing as above; a map layer for plans beneath the route; automatic plans at zoom 18 and closer for route buildings in view; design prose.
- Excluded: wall geometry (tracing MIT's drawings needs Facilities' written permission).

## Requirements

- No plan shape is drawn over the route line.
- Rooms with area draw as boxes of that area; rooms without area draw as small markers; positions shared by several places still draw only the corridor.
- Corridors draw as strokes between each corridor and its nearest corridors within 40 m, the same rule the map uses to link them.
- At zoom 18 and closer, each route building whose outline is in view shows the floor the route first uses in it; zooming out hides automatic plans; a plan chosen by hand stays until hidden.

## Active decisions

- Area comes from the inventory's SQ FT × 0.0929; boxes are squares aligned to the direction of the outline's longest edge — a schematic of size and position, not walls; the page says so.
- Places gain an area (Wayfinding state, addPlace input, `_onFloor` output); other queries are unchanged.
- Execution mixed: designer and implementation simulated; critic delegated.

## Done when

- check, tests pass; the 36 and 32 floor 1 plans read as hallways with rooms; the route line stays on top; zooming in on Stata along a route shows its plan without pressing a button.

## Open questions

None.

## Activity

- Work item started after the user called the cell plans "comically wrong" and noted they covered the route.
