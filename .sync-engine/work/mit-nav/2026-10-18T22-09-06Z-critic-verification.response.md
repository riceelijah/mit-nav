## Verdict
Approve

All five findings from the blocked review (B-1 and M-1 to M-4) are resolved, and the repairs caused no regressions.

## Findings

- **B-1: Resolved.** `Wayfinding._blocked()` plus the BlockedList former in ShowOverview make every blocked connection visible, including one blocked without a report and every ride blocked through a shared service.
- **M-1: Resolved.** Entrances first; every building and the Simmons lobby are entrances.
- **M-2: Resolved.** Route steps carry their connection; flagging starts from a step.
- **M-3: Resolved.** `_link` is optional.
- **M-4: Resolved.** Brief names all four queries; SearchPlaces no-match is an empty list.
- **Direct regressions: none.** A reported blocked connection appears in both lists; display duplication only.
