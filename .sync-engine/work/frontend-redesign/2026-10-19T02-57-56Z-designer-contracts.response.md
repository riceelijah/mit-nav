## Status
Complete

- M1: straight fallback walks cost 1 + metres/50.
- M2: walks to an elevator or stairway written in its directions count; rides add none.
- M3: after a reroute the shown and recorded route is the new one from its start building.
- New: Wayfinding `_closest`; Campus FindClosest at /route/closest with Closest former and kind words; Preferring `units` (METERS, FEET, MINUTES) in state, set and query; Saved SetPreferences carries units; signed-out choice kept on the device.

## Changed
- design/concepts/Wayfinding.md, design/concepts/Preferring.md
- design/compositions/Campus.md, design/compositions/Saved.md

## Questions
None.

## Checks
- check-design passed.
