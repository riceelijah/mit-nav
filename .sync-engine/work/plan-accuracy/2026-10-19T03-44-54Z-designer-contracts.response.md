## Status
Complete

- F3: the seed runs only while the app is stopped, so it is the only writer and enforces its rules itself; no live race with BlockLink.
- F4: every type/range check is the endpoint's input validator on the request alone, before any concept is consulted (the existing boundary-validator mechanism; no state read).
- R1: the seed removes favorites and saved trips that refer to a removed place, so no hidden trip holds a name; history entries are kept for totals and unlisted.
- R2: every run resolves all open reports whose connection is no longer in the map, so an interrupted run is repaired by the next one.

## Changed
- design/compositions/Campus.md
- design/compositions/Saved.md

## Questions
None.

## Checks
- check-design passed.
