## Verdict
Revise

No blockers. ShowFloor/FloorPlan/_onFloor are read-only and open; outdoor network prose consistent with the brief.

## Findings
- **M1:** FloorPlan cannot deliver "places that have a position of their own": borrowed positions (corridor's or building's) are stored like real ones, so `_onFloor` returns them; coincident cells result.
- **M2:** ShowFloor's input refusals undefined (missing building, non-numeric floor).
- **M3:** Setup prose still says the seed loads the Simmons map.
- **M4:** PlaceSearch prose names the Simmons lobby as an entrance.
- **M5:** Route prose uses terrace doors closed overnight as the example; that behaviour is gone.
- **M6 (minor):** NearestPlace prose says "building's centre"; positions are now main entrances.
