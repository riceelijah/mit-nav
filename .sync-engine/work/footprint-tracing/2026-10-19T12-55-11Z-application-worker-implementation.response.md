## Status
Complete

- fit-drawings.py: open floor bounded by the building outline plus 1 m (FOOTPRINT_MARGIN); building filter on the command line. Building 10 floors 0, 3–6 fitted and traced (7, 8: too few labels).
- Plans regenerated: 1768 traced rooms (was 1558); Building 10 floor 1 now traces 100CA, 100CB, 100LA, 100LB.

## Changed
- scripts/fit-drawings.py, web/plans/*.json, tests/output.txt

## Checks
- check passed; tests pass.
- Known: 57 floor 1 (20→12) and 32 floor 0 (73→66) lose rooms that lie beyond the OSM footprint; CA/CB spill onto terraces inside the OSM outline. Follow-up keeps unbounded outlines for rooms the bounded pass misses.
