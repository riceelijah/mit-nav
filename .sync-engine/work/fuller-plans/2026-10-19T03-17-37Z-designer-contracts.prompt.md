# Role and objective

Continue work unit `fuller-plans`; role `designer`; phase `contracts`. The prior same-phase role contract remains authoritative.

# Access

This grant replaces prior access; other rules remain.

Current grant:

```json
{"readableAreas":[],"writableAreas":[{"area":"assigned-design","path":"compositions/Campus.md"},{"area":"assigned-design","path":"concepts/Wayfinding.md"}],"toolKinds":["repository-read","repository-write"],"projectShell":"project-validation","network":false,"generatedOutput":false,"longRunningProcesses":false}
```

# Guidance

Unchanged from the prior same-agent context. Apply it to the task and changed context below.

# Context

## Task

**.sync-engine/work/fuller-plans/tasks/designer-repair.md**

Repair M1..M3.

## Brief

**.sync-engine/work/fuller-plans/brief.md**

# Fuller floor plans from every room in the inventory

## Goal

Floor plans that read like plans: every room MIT's inventory places on a floor (offices, labs, closets, shafts, stairs, elevators, corridors), each drawn as the part of the building outline nearer to it than to any other room, capped at its real floor area, labelled with its number.

## Scope

- Included: the converter writes one plan file per converted building (web/plans/<building>.json: for each floor, every inventory room with a MapIT position on that floor, its room number, use, position and area); the frontend server serves them; the page draws them under the route, by hand or automatically at zoom 18+; retire the floor endpoint (Campus ShowFloor, FloorPlan), Wayfinding `_onFloor`, and the place area added for it; design prose.
- Excluded: walls from MIT's drawings (user chose not to; needs Facilities' permission).

## Requirements

- A plan shows every positioned room on the floor, not only destinations; corridors, lobbies and bridges are tinted; elevators and stairs are marked as such; the destination is highlighted.
- A room's drawn region never exceeds about 1.5 times its real area, so a room with few neighbours doesn't balloon; rooms without an area draw as their uncapped region.
- Plans stay beneath the route line and appear at zoom 18+ for route buildings in view, as before.
- Multiple floors (user request): when a building's plan shows, a floor switcher on the map lists all its floors from the plan file, marks the floors the route uses, and switches that building's plan; the plan opens on the floor of the step the person is on when that step is in the building, otherwise the first floor the route uses there, and follows the current step as it changes floor. The panel no longer lists floor chips.
- Closets and other non-destinations never appear in search or routes (they are not places).

## Active decisions

- Plans are static files written with the campus map rather than places in the database, so the routing graph and search stay limited to places people go; the floor endpoint, `_onFloor` and place area are removed as unused.
- Each region is the outline cut by the half-planes nearer the room than each other room on the floor (a nearest-label region), then intersected with a square of 1.5 × the room's area centred on it and turned to the outline's longest edge; it is a schematic, and the page says so.
- Plan files are generated data under web/plans/ and committed like data/campus.json.
- Execution mixed: designer and implementation simulated; critic delegated.

## Done when

- check, tests pass; Stata floor 1 and building 10 floor 1 read as dense plans with the route over them.

## Open questions

None.

## Activity

- Work item started; user chose the fuller schematic over traced walls.

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
