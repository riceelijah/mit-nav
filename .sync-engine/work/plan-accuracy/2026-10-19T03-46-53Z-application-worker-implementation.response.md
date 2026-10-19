## Status
Complete

- Seed writes the map straight into Wayfinding's collections and updates it in place (identity by name; connections by places + directions apart from metres; blocked kept; new rides of a blocked service start blocked; removed places take their favorites and trips; open reports on missing connections resolved every run). Campus.Setup endpoints removed; tests fill the map through the concept.
- Validators: routeInput, closestInput (hour 0–24), tripInput, finishInput; Journaling.finish refuses over 100 km.
- Converter: misread-label recovery (withMisreadings), second door within 25 m, ramped steps step-free, sidewalks named after the nearest street within 25 m (streets.json), floor 00 = -1.
- Frontend: web/steps.ts (street steps with turns, entrance walk folded in, short corners absorbed), Saved tab signed-out message, mobile sheet starts at peek, MIT-drawing choice in the floor switcher; server serves fitted drawings from data/raw/drawings and 404s missing plans.
- scripts/fit-drawings.py; check-api fixed; README/AGENTS; .dockerignore excludes data/raw.

## Changed
- scripts/seed.ts, scripts/campus-to-map.ts, scripts/fit-drawings.py, scripts/check-api.ts
- src/compositions/Campus.ts, src/compositions/Saved.ts, src/compositions/inputs.ts, src/concepts/Journaling.ts
- web/app.ts, web/steps.ts, web/server.ts, web/styles.css, web/plans/*.json, data/campus.json, generated/*
- tests/*, README.md, AGENTS.md, .dockerignore

## Checks
- bun run check passed; bun test: 65 pass, 0 fail.
- Browser: Simmons → 32-123 enters Stata along 32-100LA; MIT drawing for Stata floor 1 lines up with the outline and 32-123.
- Fits: Stata 1 and Building 10 1 at 0.2 m median label error.
