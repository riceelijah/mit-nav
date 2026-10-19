## Status
Complete

- M1: on a machine without a building's local outlines the converter keeps the outlines its current plan file already has (rooms still on the same floor); each tracing run replaces that floor's earlier outlines.
- M2: a missing inventory area is unchecked like one under 3 m²; a shared area is checked against the sharers' combined known area, unchecked when that is under 3 m².
- M3: rooms come from the floor's plan file positions (misreadings already recovered); drawing labels only fit the drawing.
- M4: elevators and stairways are never traced; seated halls are kept like any room when they pass the check.

## Changed
- design/compositions/Campus.md

## Questions
None.

## Checks
- check-design passed.
