## Status
Complete

- V6-1: a merged walk that finds no path falls back to separate walks to and from the corridor position (as the code already does), so long corridor runs are never drawn straight because of merging.
- V6-2: merging spans the same-numbered floor of the next building; the merged walk is then a two-building walk drawn in three parts.

## Changed
- design/compositions/Campus.md

## Questions
None.

## Checks
- check-design passed.
