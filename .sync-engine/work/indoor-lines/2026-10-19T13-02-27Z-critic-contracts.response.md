## Verdict
Revise

The change only affects how the page draws the line and how the local converter traces rooms. It adds no endpoint, reaction, former, computation, link or endpoint path, and changes no concept state or server acknowledgement. So no application contract is missing and there is no blocker. Three material ambiguities remain (below). They affect the brief's "Done when" condition and its "only the drawn line changes" requirement.

## Assessments

**Inventory (unchanged by this change):**
- Endpoints: ShowOverview `/map/overview`, SearchPlaces `/map/search`, FindRoute `/route/find`, FindClosest `/route/closest`, NearestPlace `/route/nearest`, BlockLink `/problems/block`, UnblockLink `/problems/unblock`. Each has one `at /path` entry and one typed link.
- Internal reactions: UnblockResolvesReports, ClearingResolvesSharedReports.
- Formers: PlaceSearch, ProblemList, BlockedList, Route, Closest, Nearest.
- Computations: none are declared, and the new prose implies none on the server. Path finding, the 4 m join, the 40 m search window and the straight-line fallback all run in the page, not in the application. No computation reads concept state.

**Obligation rows:**

| Obligation | Trigger | Closing reaction / owner | Visible success | False interval | Ack order | Retry identity / owner accepts | Recovery | Duplicate-effect risk |
|---|---|---|---|---|---|---|---|---|
| Indoor walk drawn along traced corridors | Route answered and consecutive steps are on the same floor of the same building | Page (no concept effect) | Line follows corridors and lobbies | Until plan files load, the line is straight | Comes after the FindRoute answer; route data is not affected | n/a (pure redraw, idempotent) | Redraw | None |
| Straight fallback | No traced outlines, a place more than 4 m from open floor, or no path within 40 m | Page | Straight segment | n/a | n/a | n/a | n/a | None |
| Redraw on plan load | Plan files of the route's buildings load | Page | Line replaced | Depends on when the plan is fetched (see M1) | After FindRoute | Idempotent | Reload | None |
| Route, connections and distances unchanged | Any route | Wayfinding / Route former | Same steps and costs | None | Unchanged | Unchanged | Unchanged | None. However, the off-course check reads the drawn line (see M2) |
| Tracing keeps the unbounded outline for footprint-cut rooms | Local tracing step run | Local converter step (outside the app); written into the plan file | 57/1 and 32/0 room counts restored | None (the run replaces the floor's outlines) | n/a | A rerun replaces outlines, so it is idempotent | Run it again | Overlap between a fallback outline and bounded outlines is not addressed (see M3) |
| Outlines kept on a machine without the drawings | Converter run without local outlines | Converter | Existing outlines kept | None | n/a | Idempotent | Run it again | None |

The requirement "No traced floor loses rooms relative to the unbounded tracing" is met by the clause "keeps the outline the same tracing finds without the footprint, when that one passes the checks below". The unbounded pass is held to the same area checks, so the bounded set plus the fallback set includes every room the unbounded pass keeps.

## Findings

- **M1: When the plan files load is not stated.** Plans are shown only at zoom 18 and closer, and only for buildings whose outline is in view. Yet the line is redrawn "once it has loaded the plan files of the route's buildings". The contract does not say whether the page fetches every route building's plan file when a route arrives, or only when a plan is shown.
  - If it is the second, a building that is never zoomed into keeps a straight line indefinitely.
  - So the false interval for the corridor-following line has no bound, and the "Done when" check (Simmons → 32-123 line in Fairchild and Stata) depends on that unstated behaviour.
  - The trigger for loading needs to be stated.

- **M2: Off-course measurement now uses a different line.** "Off course" is measured from the drawn line. That line now changes indoors, and it changes again during a trip when plans load. The two-reading reroute trigger can therefore behave differently from before.
  - The brief excludes changing routes ("only the drawn line changes").
  - The contract should say which line the off-course check uses (the corridor-following one or the straight segments between places), so the reroute behaviour is settled.

- **M3: Fallback outlines can overlap or leave the building.**
  - A room's unbounded outline comes from a pass where shared open areas are split among a different set of rooms. It can therefore overlap outlines kept from the bounded pass on the same floor.
  - Without the footprint, an open entrance can join a space to the outdoors. That is exactly what the bounded pass rules out.
  - The area-factor check limits how large this can get but does not exclude it. When the fallback room is a corridor or lobby, the new path finding can then route the drawn line outside the building or through a neighbouring room.
  - The contract should say how a fallback outline relates to the bounded outlines already kept on that floor, or confirm that overlap is acceptable.