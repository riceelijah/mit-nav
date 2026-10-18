## Verdict
Approve

All seven findings are resolved in the revised Wayfinding.md and Campus.md; no regressions. Saved.md (F4 preference) and declarations were not supplied, so those link targets are unverified.

## Findings
- **F1: resolved.** Route steps carry kind; only entrance arrivals auto-tick within 40 m; indoor by hand.
- **F2: resolved.** 0,0 means no position; left off map and distance checks.
- **F3: resolved.** Off course = ground distance to drawn line; same destination and step-free, current time; two fresh readings before rerouting again; no result keeps the old route.
- **F4: resolved.** Saved preference can turn location on at load; turning off stops watching.
- **F5: resolved.** Position required; 0 for unknown.
- **F6: resolved.** Ground metres; 40 m reach; 75 m off course.
- **F7: resolved.** Non-numbers refused as invalid request; off-Earth answers nothing.
- **Direct regressions:** none.
