# Role and objective

Continue work unit `indoor-lines`; role `designer`; phase `contracts`. The prior same-phase role contract remains authoritative.

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

**.sync-engine/work/indoor-lines/tasks/designer-repair-4.md**

Repair per .sync-engine/work/indoor-lines/2026-10-19T13-25-47Z-critic-verification.response.md (V1–V5).

## Brief

**.sync-engine/work/indoor-lines/brief.md**

# Indoor route lines follow corridors

## Goal

The user reported that the route line still goes through walls: indoors it is drawn straight between the positions of consecutive places. Where a floor has traced outlines, draw each indoor walk along a path inside the traced corridors and lobbies (and the rooms at either end). Also keep rooms the footprint bound cut off (Building 57 floor 1, Stata floor 0).

## Scope

- Included: page-side path finding between consecutive places on one floor of one building through that floor's traced spaces on a half-metre grid: traced corridors, lobbies, bridges, unlabelled open floor and the two end places at normal cost, other traced rooms (not recovered ones) at four times the cost; tracing improvements needed for corridors to connect (doorways closed without thickening walls, area-based splitting of shared spaces, growing spaces back into doorways, unlabelled open floor, every traced space cut to the building outline); straight line when no path or no traced outlines; route redrawn once plan files load. Tracing keeps, for a room the footprint-bounded pass misses, the outline an unbounded pass finds.
- Excluded: changing routes or distances (only the drawn line changes); outdoor lines; rides between floors.

## Requirements

- The line never changes which places or connections a route uses, or any distance.
- Rooms the footprint bound cut off are recovered where it is safe: not corridors, lobbies or bridges (the line could be led outdoors through them) and not overlapping a bounded outline beyond a shared wall. Others stay untraced and draw approximately, as before tracing.

## Done when

- check and tests pass; the Simmons → 32-123 line inside Fairchild and Stata follows corridors in the browser; 57/1 and 32/0 counts rise from 12 and 66.

## Open questions

None.

## Activity

- Draft path finder tested on an L-shaped corridor.
- R1 from verification: requirement narrowed (safety over full recovery), with the user's goal (no lines through walls or outdoors) taking precedence.
- Scope widened after implementation showed gaps with circulation-only paths (V1 of the third verification).

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
