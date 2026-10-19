# Role and objective

Continue work unit `frontend-redesign`; role `designer`; phase `contracts`. The prior same-phase role contract remains authoritative.

# Access

This grant replaces prior access; other rules remain.

Current grant:

```json
{"readableAreas":[],"writableAreas":[{"area":"assigned-design","path":"compositions/Campus.md"},{"area":"assigned-design","path":"compositions/Saved.md"},{"area":"assigned-design","path":"concepts/Preferring.md"},{"area":"assigned-design","path":"concepts/Wayfinding.md"}],"toolKinds":["repository-read","repository-write"],"projectShell":"project-validation","network":false,"generatedOutput":false,"longRunningProcesses":false}
```

# Guidance

Unchanged from the prior same-agent context. Apply it to the task and changed context below.

# Context

## Task

**.sync-engine/work/frontend-redesign/tasks/designer-repair.md**

Repair M1..M3 from 2026-10-19T02-56-43Z-critic-contracts, and add (per the updated brief) Wayfinding _closest, endpoint Campus.Routing.FindClosest at /route/closest with former Campus.Routing.Closest, and Preferring units (METERS, FEET, MINUTES) with SetPreferences carrying it.

## Brief

**.sync-engine/work/frontend-redesign/brief.md**

# Map-first frontend redesign, honest distances, nearest-of-a-kind search, distance units

## Goal

Make the site look and work like a navigation app on desktop and phone (frontend-design skill), and make route costs and the shown distance honest now that outdoor walks follow many short path segments.

## Scope

- Included: web/ redesign (map fills the screen; desktop side panel; phone bottom sheet with a collapsed peek of the destination and current step; destination plaque; tabs for route, saved things and problems; sign-in dialog; Barlow type; MIT palette); outdoor path segments cost metres/50 with the +1 kept only for the walk to or from a building door; the page's distance is the sum of metres written in the directions; design prose for both.
- Also included (user request): finding the nearest restroom, food, study space or lounge by route from the start; a distance-units preference (metres, feet and miles, or walking minutes).
- (Superseded) Excluded: concept or endpoint changes.
- Concept changes are limited to Wayfinding `_closest` and Preferring `units`; one new endpoint /route/closest.

## Requirements

- Desktop and phone layouts work, keyboard focus is visible, reduced motion is respected.
- A route with many short outdoor segments is not penalised for its bends; the shown distance for Simmons Hall → 32-123 is close to the walked metres, not inflated.
- Finished trips record the same metres the page shows.
- "Nearest" answers up to 5 places whose names match the kind, ordered by route cost from the start under the same step-free and hour rules as routing.
- Distances everywhere on the page (steps, totals, history, nearest results) follow the chosen units; signed-out people's choice is kept on the device.

## Active decisions

- Visual plan per the frontend-design skill: concrete #E7EAE6, plan ink #1C2B39, MIT cardinal #A31F34 for the route and primary actions, signage yellow #F2CF5B only for the current step, accessibility blue #1F5FAD for the person and step-free; Barlow and Barlow Condensed (Google Fonts); the destination as a door plaque is the one loud element.
- Distance shown and recorded = sum of "about N m" in the route's directions (elevator and stair rides add none); it remains an estimate.
- Walking minutes use 80 m per minute (about 1.3 m/s).
- Kinds for nearest map to room-use words in generated names: Restroom → Lavatory, Food → Food Facility, Study space → Study, Lounge → Lounge.
- Execution mixed: designer and implementation simulated; critic delegated.

## Done when

- check passes; tests pass; desktop and 375 px screenshots reviewed; Simmons → 32-123 shows about 1 km.

## Open questions

None.

## Activity

- Work item started after the redesign was drafted in web/ (uncommitted) and an inflated 2.6 km estimate was seen.

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
