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

**.sync-engine/work/mit-nav/tasks/designer-blocker.md**

Resolve critic record 2026-10-18T22-07-35Z-critic-contracts (Blocked):
- B-1: add Wayfinding `_blocked() : many (link, sourceName, destinationName, forward, service)` listing every blocked connection; the overview answers the open problems and the blocked connections, so a blocked connection without a report can still be marked clear.
- M-1: say "entrances first (every building and the Simmons lobby are entrances)".
- M-2: state that each route step carries its connection and flagging starts from a step.
- M-3: declare `_link` optional.
- M-4: brief names the queries; SearchPlaces states no matches is an empty answer.

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
- (Superseded) Composition renamed Simmons → Campus. Wayfinding gains one query, `_sameService(link)`, so clearing an elevator resolves reports on all its rides; deriving siblings from `_links` in the composition would also match every link with an empty service. Otherwise concept contracts change only in purpose prose.
- Active: Composition renamed Simmons → Campus. Wayfinding gains the queries `_sameService(link)` (clearing an elevator resolves reports on all its rides), `_search(text)` (picker), `_link(link)` (labels a report), and `_blocked()` (every blocked connection, so one blocked without a report can still be cleared); its actions and state are unchanged.
- Active: The browser never receives the whole map. The picker searches the server (at most 40 matches per request), and the overview answers only open problems, each labelled with its connection's places and direction. Reason: the engine forms ~0.4 ms per row, so listing 9k places and 15k connections took 21 s.
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
- Designer/contracts simulated by coordinator: composition Simmons → Campus, Wayfinding purpose prose. Syntax check passed.
- Critic/contracts delegated (Claude Code agent): Revise with M-1..M-6. Note: coordinator had copied data/raw/osm.json into the app during the critic run; moved aside so completion could verify the critic changed nothing, then restored.
- Designer repair simulated: BlockLink order/refusals/recovery, `_sameService` + ClearingResolvesSharedReports, open setup endpoints, endpoint inputs/answers, overview order.
- Critic verification (same agent): Revise on M-4 codes and R-1 (new concept query vs brief). Brief decision updated to allow `_sameService` (old entry kept, marked superseded).
- Designer repair 2 simulated: stable refusal codes named; naming convention stated. Edits were applied by the coordinator just before that record was prepared.
- Critic verification 2: Approve.
- Application worker simulated: composition/assembly rename, `_sameService`, heap Dijkstra, converter, seed, tests, frontend scale fixes, docs. Checks: generate, check, 13 tests pass; local app seeded (3678 places, 7195 connections) and the Simmons → 32-123 journey verified in the browser.
- design/journey.md (not a contract) is updated after handback so it does not change the approved design digest.
- Independence: designer and implementation were simulated (not independent); only the contract critic was independent.
- After handback, loaded 42 building interiors (8.9k places, 15.3k connections). The overview took 21 s / 4.8 MB: concept queries take ~110 ms, and the engine's formers cost ~0.4 ms per row (places alone 3.3 s). Reopened for a search-based picker.

# Result

Unless the task requests another format, use these prior fields: `## Status`, `## Changed`, `## Questions`, `## Checks` (optional).
