## Verdict
Blocked

The search change follows the new decision that the browser never receives the whole map, but taking connections out of the overview breaks the accepted recovery path for flagging (B-1).

## Findings

- **B-1 (blocker): The accepted BlockLink recovery can no longer be reached.** A connection blocked without a report appears in neither the open-report list nor route steps, so "mark it clear and flag it again" has no reachable trigger; same for other rides of an elevator blocked through its shared service unless one carries the report. Need a way to see connections blocked without an open report, or a different recovery.
- **M-1: "Buildings first" does not match `_search`, which puts entrances first.** State entrances first, or that building places are ENTRANCE places.
- **M-2: The source of a connection to flag is not stated.** State that FindRoute's steps carry each connection and flagging starts from a route step.
- **M-3: `_link` declares the wrong cardinality.** One row or none: declare optional.
- **M-4: The new queries change the concept beyond what the brief's active decision allows.** `_search` and `_link` not named by the brief. Also state that a search with no matches is an empty answer, not a refusal.
