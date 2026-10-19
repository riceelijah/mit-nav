## Verdict
Revise

The changed set has the application contracts the brief needs (the Campus and Saved compositions, with their endpoints and links). The blocker is something else: Campus.md now says the seed removes places and connections that drop out of the map. That contradicts Saved.md, and it can leave open reports that nothing can resolve. See F1 and F2.

## Assessments

| Obligation | Trigger | Closing reaction / owner | Visible success | False interval | Ack order | Retry identity / owner accepts | Recovery | Dup-effect risk |
|---|---|---|---|---|---|---|---|---|
| FindRoute input checks | route request | FindRoute → Routing.Route (query only) | numbered steps or empty list | none | validate → query → answer | n/a (no effect) | resend | none |
| FindClosest input checks | closest request | FindClosest → Routing.Closest | ≤5 places by cost, or empty | none | validate → query → answer | n/a | resend | none |
| NearestPlace | lat/lng request | NearestPlace → Routing.Nearest | optional entrance | none | validate → query → answer | n/a | resend | none |
| BlockLink | signed-in flag | Wayfinding block then Reporting record | report | blocked without a report if recording fails (stated) | block → report → answer | none; a retry is refused ALREADY_BLOCKED | unblock, then flag again (stated) | none (second report refused) |
| UnblockLink + UnblockResolvesReports + ClearingResolvesSharedReports | signed-in clear | Wayfinding unblock; Reporting resolves | connection | reports open after clear (deferred reaction) | unblock → answer; resolve reactions not ordered before answer | connection id; owner refuses NOT_BLOCKED on repeat | none if the resolve reaction is lost (unchanged contract) | low |
| Seed update in place (new) | operator runs seed | **no declared owner action** (writes "straight into Wayfinding's state") | none (offline) | mixed old/new map if a run stops partway | n/a | place name; connection = (two places, directions); no owner action is declared to check them | re-run (implied) | identity churn when directions change (F2) |
| SaveTrip input checks | save request | Planning save after Wayfinding._place check | trip | none | validate → place check → save → answer | none; a retry is refused TRIP_NAME_TAKEN | resend | none |
| FinishTrip / Journaling.finish 0–100 km | end of route | Journaling.finish | entry | none | validate → place check → finish → answer | none; a duplicate entry is accepted (stated) | resend | accepted duplicate (stated beta trade-off) |
| MIT-drawing layer | local script + frontend | outside the application (no endpoint, no concept) | toggle only when the file exists | n/a | n/a | n/a | n/a | n/a |

Inventory of endpoints and paths: ShowOverview /map/overview, SearchPlaces /map/search, FindRoute /route/find, FindClosest /route/closest, NearestPlace /route/nearest, BlockLink /problems/block, UnblockLink /problems/unblock, ShowMine /me, Favorite /me/favorites/add, Unfavorite /me/favorites/remove, SaveTrip /me/trips/save, RemoveTrip /me/trips/remove, SetPreferences /me/preferences/set, FinishTrip /me/trips/finish. The Setup endpoints are gone, which matches the brief, and nothing in the set still links to them.

- **Internal reactions:** UnblockResolvesReports and ClearingResolvesSharedReports.
- **Formers:** PlaceSearch, ProblemList, BlockedList, Route, Closest, Nearest, MyFavorites, MyTrips, MyPreferences, MyHistory, MyTotals.
- **Not verifiable:** computations and typed links, because `design/types.md` and the Wayfinding, Reporting and Planning contracts were not supplied (see F4).

The Journaling action is correct. Its two `where` clauses split the number line completely for finite values (JSON cannot carry NaN), a refusal changes nothing, and repetition is spelled out. The `_history` and `_totals` cardinality, ordering and empty cases are all stated.

## Findings

**F1 (blocker): place removal contradicts Saved and breaks the saved-things listings.**
- Campus.md: "places and connections no longer in the map are removed."
- Saved.md still says "places are never removed, every one of them is listed."
- After a regeneration that renames or drops a place, the favorites, trips and journal entries that refer to it point at a place `Wayfinding._place` no longer knows.
- No contract says how MyFavorites, MyTrips or MyHistory behave then (drop the row, list it without a name, or fail). It is also unclear whether the person can still remove such a favorite or trip, since Unfavorite's NO_SUCH_PLACE check order and RemoveTrip are unaffected but untested here.
- The brief requires that favorites, trips and history survive a map update. Identity by unchanged name only partly delivers that.

**F2 (blocker): open reports on a removed connection can never be resolved.**
- The seed keeps a connection's identity only when its two places and its directions are unchanged. Directions carry metres ("Walk about 30 m…"), so any change in measured distance makes a new connection and removes the old one.
- If the old connection was blocked, its block is lost and its open report is left behind.
- ProblemList shows each report with "its connection's two places and its directions" and promises "an open problem is never hidden". Neither can hold once the connection is gone.
- Reports are resolved only by reaction to UnblockLink, and UnblockLink refuses an unknown connection with NO_SUCH_LINK. No available action resolves such a report, so this required work cannot be recovered.
- The same gap applies to elevator service sharing: when the seed adds a ride to an elevator that is out, nothing says whether the new ride starts blocked.

**F3 (material): the seed mutates Wayfinding with no declared owner action.**
- "Writes … straight into Wayfinding's state" names the effect but no Wayfinding action that owns it.
- The rules that action would carry are race- and invariant-sensitive: upsert keyed by name, matching connections on (places, directions), keeping or dropping blocked status, removing what is gone, shared-service consistency.
- With the Setup endpoints removed, the design does not say which Wayfinding actions, if any, the seed uses, so these rules have no enforcing owner.
- The Wayfinding contract was not supplied, so I could not check whether it already declares such actions.
- The seed's failure behaviour is also unstated: a partial run leaves a mixed map, and only an implied re-run repairs it.

**F4 (material, cannot verify): the new input checks imply computations I could not see.**
- The prose now implies pure checks: text or boolean or number type checks, hour in 0–24, and metres being a number, for FindRoute, FindClosest, NearestPlace, SaveTrip and FinishTrip.
- Each should be a declared computation (or covered by declared boundary types) with an exact typed link and a matching endpoint entry in `design/types.md`.
- `design/types.md` was not supplied, so I cannot confirm these declarations exist, or that none of them reads concept state.
- Please supply it (and the Wayfinding, Reporting and Planning contracts) before approval.

**F5 (material): the "invalid request" refusal has no stable code.**
- FindRoute, FindClosest, NearestPlace, SaveTrip, SetPreferences and FinishTrip all refuse "as an invalid request".
- No stable refusal code or meaning is given, unlike every other refusal in the set (NOT_SIGNED_IN, NO_SUCH_PLACE, INVALID_DISTANCE and so on).
- The boundary guidance requires every refusal to carry a stable code.

**F6 (material): the order of refusals in FinishTrip is unspecified.**
- One request can fail several checks at once: an unknown place with a negative distance, or a non-number with an unknown place.
- The composition lists the refusals but not which wins.
- Saved.md does state that NO_SUCH_PLACE comes "before anything is kept", so the effect side is safe. Only the visible refusal is ambiguous.