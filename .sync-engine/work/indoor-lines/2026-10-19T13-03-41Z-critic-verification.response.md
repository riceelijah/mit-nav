## Verdict
Revise

M1 and M2 are fixed. The new M3 wording fixes M3's original concern, but it directly breaks one of the brief's requirements (R1 below).

## Findings

- **M1: Resolved.** The page now fetches the plan files of all the route's buildings as soon as a route arrives, whether or not their plans are shown, and redraws the line once they load. That puts a bound on the time the line stays straight and no longer depends on zoom. The "Done when" browser check can now be met.
  - Editorial note only, not material: the sentence "the route's places, connections and distances are the same, When a route arrives…" has a comma where a full stop belongs.

- **M2: Resolved.** Off-course is measured against the straight lines between the route's places. The indoor-paths paragraph and the off-course paragraph say this the same way, so rerouting is unchanged. This matches the brief: "only the drawn line changes".

- **M3: Resolved, but it directly causes R1.** A footprint-cut room now gets its unbounded outline only when that outline:
  - overlaps no outline kept from the bounded tracing, and
  - is not a corridor, lobby or bridge.

  That rules out overlapping outlines, and it stops the drawn line being led outdoors.

- **R1: Direct regression of the brief's requirement "No traced floor loses rooms relative to the unbounded tracing."** The two new conditions drop rooms that the unbounded tracing keeps:
  - Any corridor, lobby or bridge that the footprint cuts off is now lost, even when its unbounded outline passes the area checks. Spaces under a plaza, such as Stata floor 0, are likely to include circulation.
  - Any footprint-cut room whose unbounded outline overlaps a bounded outline is also lost.

  As a result, the contract no longer guarantees that the 57/1 and 32/0 room counts get back to at least their earlier values, which "Done when" requires. Either the requirement or the M3 fix has to give way. For example, an outline could be kept for drawing the plan but left out of path finding. The contract must settle which, and say how the brief's requirement still holds.