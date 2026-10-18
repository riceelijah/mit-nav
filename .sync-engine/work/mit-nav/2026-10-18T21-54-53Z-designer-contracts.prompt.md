# Role and objective

Continue work unit `mit-nav`; role `designer`; phase `contracts`. The prior same-phase role contract remains authoritative.

# Access

This grant replaces prior access; other rules remain.

Current grant:

```json
{"readableAreas":[],"writableAreas":[{"area":"assigned-design","path":"compositions/Campus.md"},{"area":"assigned-design","path":"compositions/Simmons.md"},{"area":"assigned-design","path":"concepts/Wayfinding.md"},{"area":"assigned-design","path":"types.md"}],"toolKinds":["repository-read","repository-write"],"projectShell":"project-validation","network":false,"generatedOutput":false,"longRunningProcesses":false}
```

# Guidance

Unchanged from the prior same-agent context. Apply it to the task and changed context below.

# Context

## Task

**.sync-engine/work/mit-nav/tasks/designer-repair2.md**

Repair verification findings M-4 (stable refusal codes) and R-1 (concept query vs brief) from record 2026-10-18T21-53-56Z-critic-verification. Name the concept refusal codes in each endpoint's prose; the brief now records an active decision allowing `_sameService`. Make the M-5 naming convention explicit.

## Brief

**.sync-engine/work/mit-nav/brief.md**

# MIT campus navigation (Simmons → MIT)

## Goal

Grow the Simmons Hall navigator into an MIT campus navigator: every campus building is a place connected by outdoor walks, and building interiors (floors, elevators, stairs, rooms) are generated automatically from MIT's space-accounting data, starting with the main group and Simmons and continuing in order of importance to a Course 6 student.

## Scope

- Included: a converter script that turns MIT room-inventory exports (per building, per floor, with room use) plus OpenStreetMap building footprints into the existing map format (places and connections); seeding both the existing hand-made Simmons map and the generated campus map; routing that stays fast at campus size; composition renamed from Simmons to Campus with design prose updated; UI title and picker wording for a campus.
- Excluded for this change: accounts and sessions, visual design study and restyling, deployment, room-level geometry inside a floor (a floor is one corridor hub), per-floor accuracy of where touching buildings connect.

## Requirements

- Every MIT building with a footprint in OpenStreetMap appears as a place, reachable from every other by outdoor walks.
- For each building with a room list: one corridor hub per floor (and per tower where a floor is split, such as Stata D/G), elevators linking every floor they serve as one service (flagging one ride blocks the whole elevator), stairs linking neighbouring floors (not step-free), and visitor-relevant rooms (classrooms, lecture halls, labs, offices, lounges, study, food, restrooms) reachable from their floor.
- Buildings whose footprints touch are connected indoors on the floors both have.
- Simmons Hall keeps its detailed hand-made map and joins the campus through its main lobby entrance.
- Routes are still the cheapest path, with ties broken toward earlier connections, and answer quickly with tens of thousands of connections.
- Raw MIT data and PDFs are never committed (Facilities requires permission to redistribute drawings); only the derived graph is.

## Active decisions

- Floor plan PDFs carry no machine-readable room labels (labels are vector outlines), so the converter reads MIT's room-inventory CSV exports (same source as the plans) instead. User asked for "a program that can automatically convert these floor plans"; the room inventory is that data in tabular form.
- Building adjacency comes from OpenStreetMap footprints touching within 2 m; touching buildings are assumed connected on every floor both have. Known overconnection; accepted for beta.
- A floor is a single corridor hub, so directions say which floor and which elevator/stairs but not which turn to take in the corridor.
- (Superseded) Composition renamed Simmons → Campus; concept contracts are unchanged except purpose/principle prose.
- Active: Composition renamed Simmons → Campus. Wayfinding gains one query, `_sameService(link)`, so clearing an elevator resolves reports on all its rides; deriving siblings from `_links` in the composition would also match every link with an empty service. Otherwise concept contracts change only in purpose prose.
- Execution mixed: designer simulated by coordinator; contract critic delegated to a Claude Code general-purpose agent.

## Done when

- `bun run campus` regenerates `data/campus.json` from `data/raw/` and prints counts.
- `bun run seed` loads Simmons plus campus; a route from a Simmons room to 32-123 crosses outdoors and uses the Stata elevator when step-free is ticked.
- Flagging a Stata elevator ride reroutes step-free visitors through another elevator.
- `bun test` passes, including a converter test and a routing test at campus scale.
- `bun run check:design`, `bun run generate`, `bun run check` pass.

## Open questions

None.

## Activity

- Work item started.
- Researched whereis.mit.edu (public building search JSON), mitmapit.org (room data behind login), floorplans.mit.edu (PDFs per floor; room inventory CSV per building). Downloaded room lists for 1–8, 10, 11, 13, 26, 32, 34, 36, 38 via the user's Firefox into gitignored `data/raw/`.

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
