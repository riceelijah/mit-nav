Implement the approved plan-accuracy + audit-fix design:
- scripts/seed.ts writes data/campus.json straight into the database, updating in place (identity by place name; connection identity apart from metres; blocked kept; new rides of a blocked service start blocked; removals with favorites/trips; resolve open reports on missing connections). Remove the Campus.Setup endpoints; tests add places through the concept.
- Input validators: FindRoute/FindClosest (text places, boolean flag, hour 0–24), SaveTrip (text name/places, boolean flag), FinishTrip (text places, number metres); Journaling.finish refuses over 100 km.
- Converter: tolerant OCR label matching (unique only), rooms attach to two nearest corridors within 25 m, steps with a wheelchair ramp are step-free, sidewalks named after the nearest named street within 25 m, floor "00" is floor -1.
- Frontend: outdoor steps split by street with turns, entrance walk merged into the outdoor step, Saved tab signed-out message, mobile sheet starts at peek, MIT-drawing option in the floor switcher when a fitted drawing exists; server serves drawings from data/raw/drawings when present and 404s missing plan files.
- scripts/fit-drawings.py fits downloaded PDFs; stale check-api fixed; dead code; README; .dockerignore.
- Tests, regenerate data, check.
