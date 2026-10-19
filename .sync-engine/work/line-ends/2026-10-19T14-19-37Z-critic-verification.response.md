## Verdict
Approve

Both findings are resolved. I found nothing in the new wording that undoes an earlier fix.

## Findings
- **V6-1: resolved.** When a merged walk finds no path, for example when a long run of corridors puts its two places beyond the 40 m search area, its walks are drawn separately, each to and from the corridor's position. That is the drawing before this change, so a long corridor run is no longer drawn straight. Two cases are worded loosely but are not material:
  - In a chain of several pass-through corridors, it is not said whether a failure undoes every merge or only the one that failed. Either reading gives a line no worse than before the change.
  - A two-building walk whose crossing exceeds 20 m is drawn straight instead of "finding no path". The separate walks would include that same straight crossing, so the drawn result does not get worse.
- **V6-2: resolved.** A pass-through corridor between a place on its floor and a place "on the floor with the same number in the next building" is now merged. The merged walk is defined as a walk between two buildings, drawn in three parts. That matches the 36-100CB → 32-100LA case in the brief, and it fits the existing rules for the three parts and the 20 m crossing.
- **Direct regressions: none.**