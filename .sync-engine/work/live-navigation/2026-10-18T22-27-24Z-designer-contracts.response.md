## Status
Complete

Wayfinding: places gain latitude/longitude (0,0 = unknown), addPlace takes them, `_route` steps, `_place` and `_search` answer positions, new `_nearest(latitude, longitude)` (closest entrance with a known position, earliest added on a tie, none otherwise). Campus: prose for the map, client-side progress tracking and rerouting, and endpoint Campus.Routing.NearestPlace at /route/nearest with former Campus.Routing.Nearest; positions are never stored.

## Changed
- design/concepts/Wayfinding.md
- design/compositions/Campus.md

## Questions
None.

## Checks
- check-design: passed for 16 files.
