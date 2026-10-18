# Role and objective

Continue work unit `mit-nav`; role `designer`; phase `contracts`. The prior same-phase role contract remains authoritative.

# Access

This grant replaces prior access; other rules remain.

Current grant:

```json
{"readableAreas":[],"writableAreas":[{"area":"assigned-design","path":"compositions/Campus.md"},{"area":"assigned-design","path":"compositions/Simmons.md"},{"area":"assigned-design","path":"concepts/Wayfinding.md"},{"area":"assigned-design","path":"types.md"}],"toolKinds":["repository-read","repository-write"],"projectShell":"project-validation","network":false,"generatedOutput":false,"longRunningProcesses":false}
```

# Guidance

Unchanged from the prior same-agent context. Apply it to the task and changed context below.

# Context

## Task

**.sync-engine/work/mit-nav/tasks/designer-repair.md**

Repair critic findings M-1 to M-5 (record 2026-10-18T21-50-48Z-critic-contracts):
- M-1: in Campus.md state that BlockLink blocks first and records the report only after the block succeeds; a refused block (NO_SUCH_LINK → not found, ALREADY_BLOCKED → conflict) records no report; if recording the report fails after the block, the visitor marks it clear and flags it again.
- M-2: add Wayfinding query `_sameService(link)` answering every other link that shares the link's non-empty service; add reaction Campus.Problems.ClearingResolvesSharedReports resolving the open reports of each such link after a successful unblock. A second flag on a ride of an elevator that is already out is refused ALREADY_BLOCKED and records no report.
- M-3: state that Setup endpoints are open to anyone in this version because accounts are out of scope.
- M-4: state each endpoint's inputs, answer, and refusals; FindRoute answers an empty list when no route exists or a place is unknown.
- M-5: state that the overview lists places in the concept's order (floor, then insertion) and the client groups them by building.
Check design syntax afterwards.

## Brief

**.sync-engine/work/mit-nav/brief.md**

Unchanged from the prior same-agent context.

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
