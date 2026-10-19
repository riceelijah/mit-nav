# Traced rooms: plan shapes from MIT's drawings

## Goal

The user asked to remake the schematic plans by tracing MIT's floor-plan drawings, keeping only room shapes (no walls) to avoid copying the drawings themselves. Where a downloaded drawing has been fitted to the map, each room it encloses gets its real outline; other rooms keep today's approximate shape.

## Scope

- Included: tracing in scripts/fit-drawings.py (open floor inside the walls, doorways closed, text ignored; each room's space from around its label; shared open spaces split by nearest label; size checks); outlines saved locally (data/raw/drawings/outlines/<building>.json) and merged into the plan files by the converter; the page draws traced outlines when present; page wording.
- Excluded: tracing elevators, stairs and seated halls (their drawn interiors break the open floor); publishing the drawings themselves.

## Requirements

- Only outlines are kept: no walls, text or other drawing lines leave the machine.
- A traced room is kept only when its area agrees with the inventory within a factor of 2 (or, for a shared open space, the whole space agrees with the combined area); inventory areas under 3 m² are not checked.
- Rooms without a traced outline draw exactly as before.

## Active decisions

- The user chose to commit traced outlines (shapes derived from MIT's drawings) in the plan files; the drawings themselves stay local.
- Thresholds (0.9 m marks, ~1 m doorways, factor 2) are heuristics checked on Stata 1 and Building 10 1 (prototype: 23/60 and 56/88 rooms traced).

## Done when

- check and tests pass; plan files carry outlines for fitted floors; the page draws them; overlays on Stata 1 and Building 10 1 show traced outlines on the rooms' walls.

## Open questions

None.

## Activity

- Prototype in the scratchpad established the method and thresholds.
- Done: 1551 traced outlines committed in plan files; check and 65 tests pass; overlays checked.
