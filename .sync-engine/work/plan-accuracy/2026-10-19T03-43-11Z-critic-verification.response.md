## Verdict
Revise

F1, F2, F5 and F6 are resolved. F3 and F4 are still open. The F1 repair also caused one direct regression (R1), and the F2 repair relies on the seed behaviour that F3 leaves unowned (R2).

## Findings

**F1: resolved.**
- Saved.md no longer says "places are never removed". It now says a place can leave the map when the map is regenerated. A favorite, trip or journal entry whose place is gone is no longer listed, but the totals still count it.
- Unfavorite (NOT_FAVORITE only) and RemoveTrip (NO_SUCH_TRIP only) do not check the place, so the statement that removal still works agrees with the endpoint text.
- The two compositions no longer contradict each other.
- Identity is still kept only while a place's name is unchanged, so renaming a place still drops what refers to it. This is now stated openly rather than contradicted, so I accept it as a declared trade-off against the brief.
- See R1 for the side effect.

**F2: resolved, but it depends on F3 (see R2).**
- A connection's identity now ignores metres, so a change in measured distance alone no longer drops its block.
- A connection the seed removes has its open reports resolved, so ProblemList's promise that "an open problem is never hidden" holds again.
- A new ride on an elevator that is out starts blocked. It appears in BlockedList and can be cleared through UnblockLink.

**F3: unresolved.**
- What improved: the seed is now framed as an operator tool outside the application, like a migration. It is idempotent, and re-running it repairs a partial run, which settles the failure behaviour I asked about.
- What is still missing: no owner action exists. The seed now writes into Reporting's state as well (it resolves reports), alongside Reporting's own resolve path through UnblockResolvesReports. So that effect has two owners, one of which is undeclared.
- Its race-sensitive rules still have no enforcing owner. Those rules are upsert by name, matching connections, keeping blocked status, starting shared-service rides blocked, and removing connections together with their reports.
- Nothing says whether the seed runs while the app is live. If it does, a BlockLink on a connection the seed is removing at that moment creates a report on a missing connection again, which is the F2 failure coming back.
- To fix: declare owner actions in Wayfinding and Reporting for the seed to call, or state that the seed only runs while the app is stopped and say which owner enforces each rule.

**F4: unresolved.**
- `design/types.md` is now supplied. It contains only the concept instances, which are consistent: every Place is Wayfinding.Place, every reporter or owner is Registering.User, and a report's target is Wayfinding.Link.
- It declares no computation or boundary type for the checks the prose relies on. Those are text, boolean and number checks; the hour being from 0 to 24; latitude and longitude being numbers; and the units being METERS, FEET or MINUTES.
- The revised compositions do not link any computation for these checks either.
- The hour range and the units list cannot come from a plain type check, so at least those need declared computations.

**F5: resolved.**
- Every refusal that used to say "invalid request" now uses INVALID_REQUEST, and its meaning (input of the wrong type or out of range) is stated at each use. That covers FindRoute, FindClosest, NearestPlace, SaveTrip, SetPreferences and FinishTrip.

**F6: resolved.**
- FinishTrip now gives the order, and the first check that fails is the answer: INVALID_REQUEST, then NO_SUCH_PLACE, then INVALID_DISTANCE.
- This matches Journaling.finish, which only checks the distance.

**Direct regressions**

**R1 (material, from the F1 repair): a hidden trip still holds its name.**
- Once a trip is hidden because its place is gone, it still takes up its name. Saving a new trip under that name is refused with TRIP_NAME_TAKEN, but the person sees no trip by that name.
- RemoveTrip needs the trip's identity, which only MyTrips gives out, and MyTrips no longer lists it. So "removing such a trip still works" cannot actually be done from the visible flow, and the name stays taken.
- The same applies to a hidden favorite: Unfavorite works, but nothing shows the person what to remove.
- To fix, choose one:
  - list such rows with the place marked as gone;
  - let a trip's name be reused when its existing trip is hidden;
  - have the seed remove trips and favorites whose place is gone.
  Then state the choice in Saved.md.

**R2 (material, the F2 repair relies on F3): an interrupted run can leave reports open for good.**
- The seed resolves only the reports on a connection that run removes. If a run stops after removing a connection but before resolving its reports, the re-run finds nothing left to remove. Those reports stay open with no connection.
- That brings back exactly the failure F2 described, so the claim that re-running repairs a partial run does not hold for reports.
- To fix: state that every run resolves all open reports whose connection is no longer in the map, or order the steps so reports are resolved before the connection is removed.