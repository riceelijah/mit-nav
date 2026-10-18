## Verdict
Revise

Server parts sound; client tracking and rerouting prose leaves out behaviour needed for visible success.

## Findings
- **F1 (blocker):** Route steps carry nothing to tell outdoor from indoor; indoor steps share their building's position and would tick themselves off. Need one stated rule for which steps the page may tick automatically.
- **F2:** 0,0 positions come back like real ones; the page is never told to treat 0,0 as no position.
- **F3:** Rerouting underspecified: new FindRoute inputs (destination, step-free, hour), what the person sees when NearestPlace answers nothing or the route is empty, counter reset after a reroute, and what "from the route" means.
- **F4:** Opt-in rules missing: saved preference branch and turning off stops watching.
- **F5:** Unclear whether AddPlace's position is optional.
- **F6:** "Straight-line distance" in `_nearest` not pinned down (ground vs degrees); client reach radius unstated.
- **F7:** NearestPlace declares no behaviour for missing, non-numeric or out-of-range coordinates.
