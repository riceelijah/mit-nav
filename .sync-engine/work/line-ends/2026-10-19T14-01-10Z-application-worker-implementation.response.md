## Status
Blocked

- Tested against the plan files: no traced floor joins Fairchild to Stata (Stata's drawing ends at its west wall; the gap is the passage outside it), so a two-building path never exists; and the nearest open floor to 32-123's position is an unreachable pocket inside the hall, so drawing the hall there still crosses its wall.

## Changed
- web/app.ts, web/indoor.ts (partial)

## Questions
- Design change needed: end a walk at the open floor nearest its destination that the walk can reach; join two buildings by crossing straight between the open floor each reaches nearest the other.

## Checks
- tsc passed.
