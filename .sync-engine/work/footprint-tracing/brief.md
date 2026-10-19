# Footprint-bounded tracing

## Goal

The user reported Building 10's corridors missing from the traced plans. Ground-floor lobbies and corridors next to entrances were joined to the outdoors through open doors and discarded as "outside" (91 of 137 circulation spaces traced). Bound the open floor by the building's footprint so they trace, and add Building 10's other floors' drawings.

## Scope

- Included: tracing treats everything beyond the building's outline plus a 1 m margin as closed; a building filter for the fitting script; Building 10 floors 0 and 3–8 PDFs fitted and traced; regenerated plans.
- Excluded: other tracing rules.

## Requirements

- Building 10 floor 1's 100CA, 100CB, 100LA and 100LB are traced and lie on their walls.
- No floor loses traced rooms it had because of the footprint (spot-check counts before/after).

## Done when

- check and tests pass; circulation tracing count rises; overlay of Building 10 floor 1 shows the lobbies and corridors on their walls; browser shows them.

## Open questions

None.

## Activity

- Prototype: Building 10 floor 1 went from 56 to 63 traced rooms, all seven corridors and lobbies included.
- Done with known gaps: 57/1 and 32/0 lose some rooms outside the OSM footprint (fixed next work item).
