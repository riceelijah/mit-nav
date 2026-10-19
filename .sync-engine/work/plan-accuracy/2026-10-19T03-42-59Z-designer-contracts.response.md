## Status
Complete

- F1: Saved.md now says a place can leave the map on regeneration; favorites, trips and entries whose place is gone are not listed, totals still count every entry, and removal still works (neither removal checks the place).
- F2: a connection keeps its identity when only the metres in its directions change; a new connection sharing a blocked service starts blocked; the seed resolves open reports on connections it removes.
- F3: the seed is declared an operator tool outside the application (like a migration) with its full rule set, idempotent, so a partial run is repaired by re-running.
- F4: input checks are endpoint-boundary validators (types and ranges only, no concept state); types.md supplied for verification.
- F5: every malformed-input refusal now names INVALID_REQUEST.
- F6: FinishTrip check order stated: INVALID_REQUEST, then NO_SUCH_PLACE, then INVALID_DISTANCE.
- Also: steps mapped with a wheelchair ramp alongside, or as usable by wheelchairs, are step-free.

## Changed
- design/compositions/Campus.md
- design/compositions/Saved.md
- design/concepts/Journaling.md

## Questions
None.

## Checks
- check-design passed.
