## Status
Complete

Repaired M-1 to M-5. M-6 is context for the critic (prior text is in git: design/compositions/Simmons.md at HEAD).
- M-1: BlockLink order (block, then report), refusals (not found / conflict) record nothing, recovery by clear-and-reflag.
- M-2: new Wayfinding query `_sameService(link)`; new reaction Campus.Problems.ClearingResolvesSharedReports; second flag on an out elevator is a conflict with no report.
- M-3: Setup endpoints stated open to anyone in this version.
- M-4: inputs, answers, refusals for every endpoint; FindRoute empty list for unknown place or no route.
- M-5: overview order stated; client groups by building.

## Changed
- design/compositions/Campus.md
- design/concepts/Wayfinding.md (query `_sameService`)

## Questions
None.

## Checks
- `bunx --no-install sync-engine check-design design/concepts/*.md design/types.md design/compositions/*.md`: passed for 4 files.
