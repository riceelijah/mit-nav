# Route lines between buildings and into untraced rooms

## Goal

The user showed two places where the drawn route line still crosses walls: the walk from Fairchild's corridor (36-100CB) into Stata's lobby (32-100LA), drawn straight because the two places are in different buildings; and the last walk into 32-123, drawn to the hall's centre because the seated hall has no traced outline.

## Scope

- Included: a walk between two places on the same floor level of two different buildings uses both buildings' traced spaces for its path; a place with no traced outline is drawn at the open floor nearest it within 15 metres (usually its entrance side) instead of at its position, for walks into and out of it; start and destination are still marked at their positions.
- Excluded: routes, distances, rerouting (unchanged); outdoor lines.

## Requirements

- Only the drawn line changes.
- The line never ends inside a wall to reach an untraced room's centre when open floor lies within 15 m of it.

## Done when

- check and tests pass; in the browser the Simmons → 32-123 line goes from Fairchild into Stata along open floor and ends at 32-123's side rather than crossing its wall.

## Open questions

None.
- Revised after implementation: untraced places are met at the nearest open floor the walk can reach; two-building walks are drawn in three parts with a straight crossing, because no traced floor joins Fairchild and Stata.
- Revised again after browser testing: pass-through corridors drawn without visiting their labels; reachable join within 4 m with a step through a door; leaving closed-off places from the joining floor; walks may start or end in any traced space; room cost 20.
- Done: Simmons → 32-123 line checked in the browser end to end; 68 tests pass.
