## Verdict
Revise

The change is in the indoor route-line paragraph of `design/compositions/Campus.md`. I reviewed it against the brief using only the context in the prompt; the grant allowed no file reads. There are no blockers: the composition is supplied as the application contract, nothing on the server changes, and every endpoint, reaction and former is untouched. One finding leaves visible behaviour undecided, which is why the verdict is Revise.

## Assessments
| Obligation | Trigger | Closing reaction / owner | Visible success | False interval | Ack order | Retry identity / accepted | Recovery | Dup-effect risk |
|---|---|---|---|---|---|---|---|---|
| Walk drawn between two buildings on the same floor number | Route arrives; plan files for all of the route's buildings are fetched | Client-side drawing only; no concept or reaction | Line follows both floors' traced spaces through the connection | Until the plan files load the line is straight, then it is redrawn (stated) | Not applicable (no server effect) | Not applicable | Falls back to a straight line when no path joins the places, either place is too far from open floor, or the floor has no outlines | None |
| Line ends at an untraced destination | A walk whose destination has no traced outline | Client-side drawing only | Line ends at the nearest open floor within 15 m; the place is still marked at its position | None | Not applicable | Not applicable | Straight line when open floor is more than 15 m away | None |
| Route, distance and reroute unchanged | Not applicable | `Campus.Routing.FindRoute` / `Route` (unchanged) | Same places, connections and costs; the off-course check still measures against straight lines | None | Unchanged | Unchanged | Unchanged | None |
| Brief requirement: no line end inside a wall when open floor is within 15 m | Covered by the destination rule above | Not applicable | Met | Not applicable | Not applicable | Not applicable | Not applicable | Not applicable |

Scope matches the brief: only the drawn line changes, and routes, distances, rerouting and outdoor lines are left alone. Nothing in this change is cross-concept, authorization or acknowledgement behaviour.

Inventory, by name and unchanged:
- **Endpoints and paths, which match their reactions:**
  - ShowOverview at /map/overview
  - SearchPlaces at /map/search
  - FindRoute at /route/find
  - FindClosest at /route/closest
  - NearestPlace at /route/nearest
  - BlockLink at /problems/block
  - UnblockLink at /problems/unblock
- **Internal reactions:** UnblockResolvesReports, ClearingResolvesSharedReports.
- **Formers:** PlaceSearch, ProblemList, BlockedList, Route, Closest, Nearest.
- **Views and computations:** none declared.

The new prose implies no server-side derived value and no optional-input branch, so no computation is missing. `design/types.md` and the typed links were not supplied, so I did not check them.

## Findings
- **LE-1 (material): two-building walk where only one floor has traced outlines.** The fallback reads "the floor has no traced outlines" (singular), but the new case involves two floors. When one building's floor is traced and the other's is not, the contract does not say what happens. The line could be drawn straight, or pathed through the traced floor's spaces only, with the place in the untraced building joined at the open floor nearest it within 15 m. That open floor could sit in the other building. The contract should state which.
- **LE-2 (material, but consistent with the brief): an untraced place that is not a walk's destination.** The new end rule covers only a walk's destination. The incoming walk to an untraced intermediate place (for example an untraced corridor) now ends at open floor. The outgoing walk still starts at the place's position and joins the same open floor. The drawn line would then run from the open floor through the wall to the position and back. The same applies when an untraced room is the route's start. The brief limits the requirement to line ends, so this is not a blocker. The contract should either accept that crossing into the room explicitly or extend the rule to a walk's start.