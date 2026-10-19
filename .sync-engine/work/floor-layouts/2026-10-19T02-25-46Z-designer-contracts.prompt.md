# Role and objective

Continue work unit `floor-layouts`; role `designer`; phase `contracts`. The prior same-phase role contract remains authoritative.

# Access

This grant replaces prior access; other rules remain.

Current grant:

```json
{"readableAreas":[],"writableAreas":[{"area":"assigned-design","path":"compositions/Campus.md"}],"toolKinds":["repository-read","repository-write"],"projectShell":"project-validation","network":false,"generatedOutput":false,"longRunningProcesses":false}
```

# Guidance

Unchanged from the prior same-agent context. Apply it to the task and changed context below.

# Context

## Task

**.sync-engine/work/floor-layouts/tasks/designer-repair3.md**

Implementation finding: MapIT labels each corridor at its middle, so corridors of buildings that really join sit 18–50 m apart and the 15 m rule disconnects the Infinite Corridor. Change the joining rule: touching buildings join on a floor when each has a corridor within 35 m of the other's outline (between those two corridors); corridors of any two buildings within 15 m still join (bridges); floors without positions keep the touching rule.

## Brief

**.sync-engine/work/floor-layouts/brief.md**

# Real floor layouts and building connections

## Goal

Replace the two map simplifications: give each floor a corridor network with real positions and walking distances, and join buildings only where their corridors actually meet.

## Scope

- Included: the converter reads MapIT's room locations (data/raw/relative-room-locations.json, saved from mitmapit.org by the user while signed in) for absolute positions of rooms, corridors, lobbies, bridges, elevators and stairs; corridor nodes per floor linked by distance; rooms, elevators and stairs attached to their nearest corridor; cross-building links where corridors on the same floor are within 15 m; OSM entrances choose where a building is entered; fallback to the single-corridor floor when a floor has no positioned corridors; frontend merges consecutive corridor steps; design prose updated.
- Excluded: concept changes (Wayfinding already has places with positions and links with distances); wall-accurate paths inside a floor (corridor nodes are room-label centres, so distances are straight lines between them).

## Requirements

- (Superseded) Routes inside positioned floors use real distances, and step-free routes choose the elevator nearest the destination.
- Routes inside positioned floors use real distances, and choose the elevator that makes the whole trip cheapest, counting the walks to and from each elevator.
- Two buildings are joined on a floor only when corridors of both are within 15 m on that floor, or, for floors without positions, when their footprints touch (the old rule).
- Every place still has a position: rooms and corridors with MapIT positions get their own; an unplaced room on a floor with corridor positions takes its corridor's; single-corridor floors and their rooms keep their building's.
- Directions name distances ("Walk about 30 m to elevator E3 and take it up to floor 4").
- Tracking still ticks off only building arrivals automatically.

## Active decisions

- MapIT's positions come from labels on MIT's floor plans; about 76% of inventory rooms are located. Unlocated rooms attach to their floor's corridor nearest the centre of that floor's corridors, and take that corridor's position.
- Corridor nodes are TRANSIT places named after their room number and use ("32-100LA Lobby"), so they never appear in search.
- Indoor walking costs 0.2 plus metres/50 per connection, matching the outdoor scale (1 + metres/50), so the 50 m-per-unit distance estimate still holds.
- The raw MapIT file stays out of git; the generated map, which includes room positions, is committed, as room numbers already were.
- Execution mixed: designer and implementation simulated; critic delegated to a fresh Claude Code agent.

## Done when

- check:design, generate, check pass; converter tests cover corridor linking, nearest attachment, cross-building 15 m rule and fallback; all tests pass.
- A step-free route to a Stata room uses an elevator near it; 7 → 10 still goes through 3 indoors; the 35→37→39→38→34→36 detour disappears when corridors don't meet.

## Open questions

None.

## Activity

- Work item started; MapIT file inspected (96 buildings, 18,115 of 23,967 inventory rooms located with matching floors).

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
