# Plan accuracy and audit fixes

## Goal

Act on a check of the generated plans against MIT's PDFs (Stata floor 1, Building 10 floor 1): room positions match MIT's labels to a 0.2 m median, but some rooms are dropped because MapIT's label readings are garbled, Stata's open student street is not part of the corridor network so routes double back, and room shapes ignore walls. Add the user's second plan option: MIT's own drawing, traced from the PDFs, as a plan layer where the traced files exist.

## Scope

- Audit fixes (the user asked to fix every audit finding without losing any app functionality): remove the open Setup endpoints (anyone could add places or connections); the seed script writes the generated map straight into Wayfinding's collections and updates it in place on re-runs, keeping place and connection identities (so favorites, trips, history and blocks survive a map update) and leaving accounts alone; input checks on trips (text name and places, boolean flag), finished-trip metres (number, 0 to 100 km in Journaling) and route/closest requests (boolean flag, hour 0 to 24); sidewalks named after the street beside them and outdoor steps split by street with turn words; the entrance walk merged into the outdoor step; floor "00" as floor -1; Docker image without data/raw; README accuracy; a plan file that does not exist answers 404; the stale API check script fixed; dead code removed; the Saved tab's signed-out message; the mobile sheet opening at its peek when a route is restored; buildings cut off from step-free routes investigated.

- Included: tolerant matching of MapIT labels that differ from inventory numbers only by common OCR confusions (L/1/I, O/0/D/Q, S/5, B/8, Z/2, G/6, T/7), used only when unique on the floor (this recovers Stata's main street lobby 32-100LA, read as "1001A"); each room attaching to its two nearest corridors within 25 m (at least the nearest); an MIT-drawing layer: a local script (scripts/fit-drawings.py) OCRs each downloaded PDF in data/raw/pdfs, fits it to the floor plan's label positions (similarity transform), and writes the drawing image and its fit to data/raw/drawings; the frontend serves those when present, and the floor switcher offers "Schematic" and "MIT drawing" for such floors; design prose.
- Excluded: publishing traced drawings (data/raw stays out of git; MIT Facilities requires written permission to copy or display its drawings), routing along walls.

## Requirements

- Recovered labels never steal a position: a garbled label is used only when exactly one unmatched inventory room on that floor normalises to it.
- A route into Stata to 32-123 no longer walks past the hall to a lobby label and back.
- The MIT drawing appears only when its file exists; the deployed app without data/raw shows the schematic only and offers no drawing option.
- A fitted drawing is kept only with at least 6 matched labels and a median error of 2 m or less.

## Active decisions

- Traced drawings stay local by default; publishing them is the user's decision after asking Facilities (fis-request@mit.edu).
- Large open rooms are not made into corridors: the street is already lobbies, and its main lobby was missing only through a misread label. The 25 m two-sided attachment is a heuristic; checked against the Stata route.
- Execution mixed: designer and implementation simulated; critic delegated.

## Done when

- check, tests pass; check script reruns on Stata 1 and Building 10 1 show more rooms drawn; Simmons → 32-123 enters 32-123 from the near side; the MIT drawing toggles on for floors with PDFs and is absent otherwise.

## Open questions

None.

## Activity

- Work item started after checking plans against MIT PDFs (Stata 1: 16 labels, 0.2 m median, max 0.4 m; Building 10 1: 60 of 62 labels drawn, 0.2 m median, two rooms 6–8 m off).
- Narrowed: open rooms stay rooms; the drawing layer is the fitted PDF image, not traced vectors.
- Scope widened after an audit; the earlier critic run was cancelled before it ran.
- First verification was run by a fresh critic instance (recorded under the original critic's id); it found R1/R2 and F3/F4 open. Later rounds go to the original critic.
- Done: check and 65 tests pass; Stata route enters along 32-100LA; MIT drawing toggles on for Stata 1 / Building 10 1 (0.2 m median) and is absent where no drawing exists. E60/E62 remain unreachable step-free: OpenStreetMap maps only plain steps there.
