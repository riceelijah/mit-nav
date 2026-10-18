## Status
Complete

- F1: `_route` steps carry the arrival place's kind; only steps arriving at an entrance tick off automatically (within 40 m), indoor steps by hand.
- F2: 0,0 means no position; the page leaves such places off the map and out of distance checks.
- F3: reroute to the same destination, same step-free choice, current time; two fresh readings required before rerouting again; no nearest/no route → say so and keep the old route; off course = ground distance to the drawn line.
- F4: saved preference turns location on at load when signed in; turning off stops watching at once.
- F5: AddPlace latitude/longitude required; caller sends 0 for unknown.
- F6: `_nearest` measures ground metres; reach radius 40 m stated.
- F7: non-numbers refused as invalid request; off-Earth positions answer nothing.

## Changed
- design/concepts/Wayfinding.md
- design/compositions/Campus.md

## Questions
None.

## Checks
- check-design: passed for 16 files.
