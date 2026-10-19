## Status
Complete

Campus: floor plans come from per-building plan files (outline + every positioned inventory room per floor: number, use, position, area) served by the frontend; rooms are drawn not routed; nearest-label regions capped at a 1.5 × area square aligned to the longest outline edge; under the route; automatic at zoom 18+; floor switcher on the map (all floors, route floors marked, opens on the current step floor in that building, else first route floor, follows the current step). ShowFloor endpoint and FloorPlan former removed; AddPlace without area. Wayfinding: `_onFloor` and place area removed.

## Changed
- design/compositions/Campus.md
- design/concepts/Wayfinding.md

## Questions
None.

## Checks
- check-design passed.
