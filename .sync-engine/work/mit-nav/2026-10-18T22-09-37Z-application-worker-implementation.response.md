## Status
Complete

## Changed
- src/concepts/Wayfinding.ts: `_search` (≤40, entrances first, natural order), `_link` (0 or 1 row), `_blocked`; shared `describe` helper outside the class.
- src/compositions/Campus.ts: Overview former removed; PlaceSearch, BlockedList; ProblemList labels via `_link`; SearchPlaces at /map/search; ShowOverview answers problems + blocked.
- generated/ regenerated; web/app.ts: server-side search picker (debounced, latest answer wins), reports labelled, latest route answer wins; tests updated and added (search order/limit/empty, _link/_blocked incl. blocked-without-report, search endpoint).
- data/raw/rooms: W16, 50 added; data/campus.json regenerated (44 interiors, 8965 places, 15146 connections).

## Questions
None.

## Checks
- generate; check passed (8 advisories); tsc clean; `bun test` 16 pass.
- Local: seeded 9000 places / 15344 connections; search 18–28 ms, overview 6 ms (was 21 s); browser journey Simmons lobby → 32-G904 step-free goes outdoors, through 35/37/39/38/34/36 into 32, elevator E4 to G9.
