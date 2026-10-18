## Status
Complete

- M-4: every refusal in Campus.md now names its stable concept code (NO_SUCH_LINK, ALREADY_BLOCKED, NOT_BLOCKED, DUPLICATE_PLACE, NO_SUCH_PLACE).
- R-1: kept `Wayfinding._sameService`; the brief's active decisions now allow it (the old decision is preserved and marked superseded), because matching siblings by service in the composition would also join every link whose service is empty.
- M-5: the composition names the generated place-naming convention the client groups by.
Note: these edits were applied by the coordinator just before this record was prepared.

## Changed
- design/compositions/Campus.md

## Questions
None.

## Checks
- `bunx --no-install sync-engine check-design design/concepts/*.md design/types.md design/compositions/*.md`: passed for 4 files.
