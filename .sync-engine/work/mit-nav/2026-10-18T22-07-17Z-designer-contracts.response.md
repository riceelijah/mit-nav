## Status
Complete

Search replaces whole-map listing. Wayfinding gains `_search(text)` (≤40 non-TRANSIT places, entrances first, natural name order) and `_link(link)` (names, directions, service of one connection). Campus: Overview former removed; PlaceSearch former and SearchPlaces endpoint at /map/search; ProblemList labels each report through `_link`; ShowOverview answers only problems. `_places`/`_links` kept for tooling and tests.

## Changed
- design/concepts/Wayfinding.md
- design/compositions/Campus.md

## Questions
None.

## Checks
- `bunx --no-install sync-engine check-design design/concepts/*.md design/types.md design/compositions/*.md`: passed for 4 files.
