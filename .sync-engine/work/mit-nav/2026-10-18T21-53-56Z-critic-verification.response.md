## Verdict
Revise

Four of the six findings are resolved (M-1, M-2, M-3, M-6) and M-5 is resolved by explicit acceptance. M-4 is only partly fixed: the refusals still have no stable codes. The repair for M-2 also directly caused one regression: it adds a query to the Wayfinding concept, which the brief says must not change apart from its purpose and principle prose.

## Findings

- **M-1: Resolved.** BlockLink blocks first and records the report only after the block succeeds; recovery by clear-and-reflag works with existing actions.
- **M-2: Resolved, but the fix caused regression R-1.** Residual, not blocking: neither resolve reaction states recovery if lost after the answer; pre-existing gap.
- **M-3: Resolved.**
- **M-4: Partly unresolved.** Inputs and answers stated; FindRoute empty answer stated. Still open: refusals described only as "not found" and "conflict"; each endpoint's refusals need a stable code and meaning, e.g. NO_SUCH_LINK, ALREADY_BLOCKED, NOT_BLOCKED, DUPLICATE_PLACE, NO_SUCH_PLACE.
- **M-5: Resolved by acceptance.** Grouping by building depends on a place-naming convention not in the contract.
- **M-6: Resolved.** M-1, M-3, M-4 pre-existing.
- **R-1: Direct regression from the M-2 repair.** `Wayfinding._sameService` contradicts the brief's decision that concept contracts are unchanged except prose. Either remove it and derive siblings in the composition, or record a brief decision allowing the concept change.
