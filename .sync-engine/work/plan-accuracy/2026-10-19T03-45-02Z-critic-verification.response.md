## Verdict
Approve

F3, F4, R1 and R2 are all resolved, and the repair introduced no new problems.

## Findings

**F3: resolved.**
- The seed now runs only while the app is stopped, is the only writer while it runs, and enforces its own rules: upsert by name, connection identity apart from metres, keeping blocked status, new elevator rides starting blocked, cascading removals, and resolving reports.
- That removes the race with BlockLink, and the seed's report resolution can no longer collide with UnblockResolvesReports.
- Writing straight into Wayfinding's state is what the brief asks for. What else the seed writes is limited to removed places and connections, and everything else is explicitly left alone.

**F4: resolved. I am withdrawing my earlier requirement.**
- I had asked for each check to be declared as a computation. That was the wrong category.
- A computation is a pure derivation of a value the flow then uses. These checks derive nothing: they only accept or refuse the shape of the request before any concept is consulted.
- Under the API guidance you quoted, that is the validator stage, and it is explicit already. I could not read that file under this grant, so I am relying on your quote and on your statement that SetPreferences' units and NearestPlace's numbers use the same mechanism in approved designs.
- The design guidance also keeps framework stages out of contracts. The contract's job is to state the behaviour, and it now does: each check (types, hour 0–24, the units list, metres being a number), the INVALID_REQUEST code, and that these checks come before every concept refusal.
- No computation is missing. No optional-input branch exists (every input is required), and nothing reads concept state.

**R1: resolved.**
- The seed now removes favorites and saved trips whose place is removed, so the trip's name is free again.
- History entries for a removed place are kept and counted in the totals but not listed. That is stated plainly, and no action depends on seeing them.

**R2: resolved.**
- Every run resolves every open report whose connection is no longer in the map, and doing so twice changes nothing. Re-running therefore repairs a run that stopped partway, and ProblemList's promise that "an open problem is never hidden" holds.

**New problems:** none.