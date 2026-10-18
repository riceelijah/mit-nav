## Verdict
Revise

No blockers. Every endpoint has an application contract; each Saved and Campus Problems endpoint starts with `Sessioning.use` and none takes a person as input. The new concepts are complete mechanisms.

## Findings

- **M-01:** ProblemList doesn't say what happens when a reporter has no username (`Registering._username` is optional; older reports have non-Registering reporters). Dropping them would hide an open report.
- **M-02:** Unclear who converts route distance to metres; if the endpoint converts a computation is needed. Say plainly the request carries metres the page converted.
- **M-03:** FinishTrip has no retry identity; a retry or double fire inflates totals. Accept explicitly or deduplicate.
- **M-04:** Password Register can leave an orphan account with no recovery if set/start fails after register; Passwords.md doesn't state it.
- **M-05:** Favorite, SaveTrip, FinishTrip accept unknown places then hide them; totals and history can disagree. Refuse unknown places or state a consistent rule.
- **M-06:** Campus Setup rationale ("no accounts") is out of date.
- **M-07:** Copied concepts read the clock themselves and Commons.md has transport details in prose; record as an accepted deviation.
