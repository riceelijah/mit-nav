# Role and objective

Continue work unit `outdoor-paths`; role `designer`; phase `contracts`. The prior same-phase role contract remains authoritative.

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

**.sync-engine/work/outdoor-paths/tasks/designer2.md**

Add Wayfinding query _onFloor(building, floor) for the floor plan, matching places by the generated-name building prefix; check syntax.

## Brief

**.sync-engine/work/outdoor-paths/brief.md**

# Outdoor walks along real paths, Simmons like every building, floor plans on the site

## Goal

Outdoor legs follow OpenStreetMap's footpaths, sidewalks and crossings instead of straight lines between building centres, so the map line follows real paths and route costs use real walking distances. Simmons Hall is generated from its room list like every other building (no hand-made sections such as 8C). The site shows a floor plan, redrawn from room positions, for each floor a route passes through.

## Scope

- Included: an outdoor network from OSM walkable ways (footway, path, pedestrian, steps, cycleway, living street, residential, service, unclassified; busy roads excluded because their sidewalks are mapped separately), simplified to junctions and bends; buildings joined to it at their OSM entrances or nearest path point; building positions at their main entrance; frontend merging consecutive outdoor steps with the streets they use; Simmons generated from its room inventory (the hand-made map and its seed are retired); a Wayfinding query for the places on one building's floor and an endpoint for it; building outlines shipped to the page; the page draws each floor as cells around room positions clipped to the building outline, with corridors tinted, the destination highlighted and the route over it; tests; design prose.
- Excluded: concept changes; turn-by-turn street crossings guidance beyond the merged step.

## Requirements

- An outdoor route between two buildings follows path segments; its drawn line follows them.
- Steps (and ways tagged wheelchair=no) are not step-free.
- Every building with a path within 80 m of it joins the network; a building further from any path keeps walks to its nearest buildings so it stays reachable.
- Outdoor path places never appear in search (TRANSIT) and are not named in directions.
- Simmons places are named like every building's ("W79-xxx" rooms, corridors, elevators), with no sections such as 8C.
- Choosing a floor shows its rooms as cells inside the building outline, labelled with room numbers; rooms without positions are not drawn.

## Active decisions

- Busy roads (primary, secondary, tertiary) are left out because Cambridge's sidewalks and crossings are mapped as separate footways; walking down a road's centreline would be wrong.
- A building's place sits at its main entrance (OSM entrance=main, else the entrance nearest its centre, else its centre), so the line and the "reached it" check use the door, not the middle.
- Outdoor walks cost 1 + metres/50 per segment as before, measured along the path.
- The hand-made Simmons map is retired so every building reads the same; its terrace closing hours are lost because MIT's inventory has no hours (Wayfinding keeps closing hours for any map that supplies them).
- Floor plans are redrawn, not MIT's drawings (Facilities restricts redistributing those): each room's cell is the area nearer its label than any other's, inside the building outline. It is a schematic, and the page says so.
- The floor query matches places by the building prefix of their generated names ("32-"), since places carry no building field; generated names always begin with the building number.
- Execution mixed: designer and implementation simulated; critic delegated to a fresh Claude Code agent.

## Done when

- check:design, generate, check pass; converter tests cover path simplification, step-free steps, building attachment and the far-building fallback; all tests pass.
- 10-250 → 32-123 draws a line along real paths (or stays indoors) and no outdoor segment crosses a building.

## Open questions

None.

## Activity

- Work item started. OSM walkable ways around MIT: 3,168 ways, 15,250 vertices, sidewalks and crossings mapped.

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
