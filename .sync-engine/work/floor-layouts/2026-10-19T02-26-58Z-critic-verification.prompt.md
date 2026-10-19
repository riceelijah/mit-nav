# Role and objective

Continue work unit `floor-layouts`; role `critic`; phase `verification`. The prior same-phase role contract remains authoritative.

# Access

This grant replaces prior access; other rules remain.

Current grant:

```json
{"readableAreas":[],"writableAreas":[],"toolKinds":[],"projectShell":"none","network":false,"generatedOutput":false,"longRunningProcesses":false}
```

# Guidance

Unchanged from the prior same-agent context. Apply it to the task and changed context below.

# Context

## Verification task

**.sync-engine/work/floor-layouts/tasks/critic-verify4.md**

Verify R-1a.

## Brief

**.sync-engine/work/floor-layouts/brief.md**

# Real floor layouts and building connections

## Goal

Replace the two map simplifications: give each floor a corridor network with real positions and walking distances, and join buildings only where their corridors actually meet.

## Scope

- Included: the converter reads MapIT's room locations (data/raw/relative-room-locations.json, saved from mitmapit.org by the user while signed in) for absolute positions of rooms, corridors, lobbies, bridges, elevators and stairs; corridor nodes per floor linked by distance; rooms, elevators and stairs attached to their nearest corridor; cross-building links on a floor where touching buildings each have a corridor within 35 m of the other's outline (joining each one's corridor nearest the other's outline), or where corridors of any two buildings are within 15 m; OSM entrances choose where a building is entered; fallback to the single-corridor floor when a floor has no positioned corridors; frontend merges consecutive corridor steps; design prose updated.
- Excluded: concept changes (Wayfinding already has places with positions and links with distances); wall-accurate paths inside a floor (corridor nodes are room-label centres, so distances are straight lines between them).

## Requirements

- (Superseded) Routes inside positioned floors use real distances, and step-free routes choose the elevator nearest the destination.
- Routes inside positioned floors use real distances, and choose the elevator that makes the whole trip cheapest, counting the walks to and from each elevator.
- (Superseded) Two buildings are joined on a floor only when corridors of both are within 15 m on that floor, or, for floors without positions, when their footprints touch (the old rule).
- Touching buildings join on a floor when each has a corridor within 35 m of the other's outline; any corridors of two buildings within 15 m join (bridges); floors without positions keep the touching rule. Reason: MapIT marks corridors at their middles (measured gaps 18–50 m across real joins; 77 m across a non-join).
- Every place still has a position: rooms and corridors with MapIT positions get their own; an unplaced room on a floor with corridor positions takes its corridor's; single-corridor floors and their rooms keep their building's.
- Directions name distances ("Walk about 30 m to elevator E3 and take it up to floor 4").
- Tracking still ticks off only building arrivals automatically.

## Active decisions

- MapIT's positions come from labels on MIT's floor plans; about 76% of inventory rooms are located. Unlocated rooms attach to their floor's corridor nearest the centre of that floor's corridors, and take that corridor's position.
- Corridor nodes are TRANSIT places named after their room number and use ("32-100LA Lobby"), so they never appear in search.
- Indoor walking costs 0.2 plus metres/50 per connection, matching the outdoor scale (1 + metres/50), so the 50 m-per-unit distance estimate still holds.
- The raw MapIT file stays out of git; the generated map, which includes room positions, is committed, as room numbers already were.
- Execution mixed: designer and implementation simulated; critic delegated to a fresh Claude Code agent.

## Done when

- check:design, generate, check pass; converter tests cover corridor linking, nearest attachment, the 35 m outline rule (joins and refuses), the 15 m bridge rule, and the no-positions fallback; all tests pass.
- A step-free route to a Stata room uses an elevator near it; 7 → 10 still goes through 3 indoors; the 35→37→39→38→34→36 detour disappears when corridors don't meet.

## Open questions

None.

## Activity

- Work item started; MapIT file inspected (96 buildings, 18,115 of 23,967 inventory rooms located with matching floors).

## Original finding or routed blocker IDs

**.sync-engine/work/floor-layouts/2026-10-19T02-25-56Z-critic-verification.response.md**

## Verdict
Revise

Revised joining rule in Campus.md is complete and matches the requirement, but the brief's scope and done-when still describe the 15 m-only rule.

## Findings
- **R-1: resolved in Campus.md, unresolved in the brief.**
- **R-1a:** (1) brief scope line says 15 m only; (2) done-when does not test the 35 m outline rule; (3) "the corridor of each nearest the other" is ambiguous between the other building's outline and its nearest corridor.
- Direct regressions: none in Campus.md.

## Revised candidate context

**design/compositions/Campus.md**

# MIT campus navigation

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks. Inside the buildings whose room lists have been converted, each floor is a network of its corridors, lobbies and bridges, placed where MIT's floor plans put them and joined to one another by walking distance. Each corridor is a place that is only passed through, named by its room number and use ("32-100LA Lobby"); room numbers are unique and corridors are never also listed as rooms, so these names never collide with a room's. Every room, elevator stop and stairway with a known position attaches to the corridor nearest it; one without a position attaches to the corridor nearest the middle of that floor's corridors and takes that corridor's position. A floor whose corridors have no known positions is a single corridor instead, with its rooms opening off it.

A connection's distance is a cost, not a length: walking inside costs 0.2 plus the metres walked over 50, walking outside 1 plus the metres over 50, and an elevator ride 3.5 plus half a unit per floor plus the walks to and from it. The route is the cheapest trip under those costs, so it takes the elevator that makes the whole trip shortest, counting the walk to each elevator, rather than simply the one nearest the destination. Each connection's directions carry the metres themselves ("Walk about 30 m to elevator E3 and take it up to floor 4"), and when the page shows several corridor walks in a row as one step, it adds up the metres written in them.

The ground floor is floor 1, or the lowest floor above it when there is no floor 1, or the lowest floor. A building is entered from the corridor nearest each of its OpenStreetMap entrances within 15 metres of its outline; with no such entrance, or when the ground floor is a single corridor, it is entered at the corridor nearest the building's centre, or at that single corridor. Two buildings whose outlines touch are joined indoors on a floor when each has a corridor on that floor within 35 metres of the other's outline, joining each building's corridor nearest the other building's outline; the floor plans mark a corridor at its middle, so corridors that meet at a shared wall are usually 20 to 50 metres apart as marked. Corridors of any two buildings within 15 metres of each other on a floor, such as the two ends of a bridge, are joined as well. When either building's floor has no positions, they are joined on that floor if their outlines touch, from each building's corridor nearest the other's centre (or its single corridor).

Simmons Hall keeps its detailed hand-made map and joins the campus through its main lobby entrance. The campus has thousands of places and connections, so the app never sends the whole map to the browser. A visitor finds a place by typing part of its name: the [place search](former:Campus.Browsing.PlaceSearch) answers at most 40 matching places that can be a start or a destination, with entrances first (every building and the Simmons lobby are entrances), and the [search request](reaction:Campus.Browsing.SearchPlaces) carries the typed text and answers with those places; when nothing matches the answer is an empty list, not a refusal. Anyone can also see the problems reported so far: the [problem list](former:Campus.Browsing.ProblemList) lists open reports, each with the reporter's username from `Registering._username` (a report whose reporter has no username, such as one made before accounts existed, is still listed, with no name, so an open problem is never hidden), the names of its connection's two places and its directions, and the [blocked list](former:Campus.Browsing.BlockedList) lists every blocked connection the same way, including any blocked without a report, so it can still be marked clear. The [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both lists. Generated place names begin with the building ("Building 32, floor 1", "32-123 Lecture Hall"), so typing a building or room number finds them.

```endpoints
Campus.Browsing.ShowOverview at /map/overview
Campus.Browsing.SearchPlaces at /map/search
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because some passages, such as terrace doors, are closed overnight. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps, each carrying the connection it uses, which is where a visitor starts when flagging a passage; when either place is unknown or no route exists, the answer is an empty list rather than a refusal.

```endpoints
Campus.Routing.FindRoute at /route/find
```

Every place known to the campus map has a position: a building's is the centre of its outline; corridors and rooms placed from the floor plans have their own; a room on such a floor without one takes the position of the corridor it attaches to; and a floor that is a single corridor, with its rooms, shares its building's, as Simmons Hall's places share Simmons Hall's. A place added with latitude and longitude both 0 has none, and the page leaves such places off the map and out of every distance check. Each route step carries the kind and position of the place it arrives at, and each search result carries a position, so the page draws the route as a line through those positions, with the start and end marked.

Location stays off unless the person turns it on, or, when they are signed in, their saved preference to use their location (see [saved things](Saved.md)) turns it on when the page loads; turning it off stops the page watching at once. While it is on, the page follows progress itself. Only a step that arrives at an entrance (a building, reached by walking outside) is marked done automatically, when a reading is within 40 metres of that building's position, and every step before it is marked done too; inside a building a phone cannot tell where it is, so the person marks indoor steps done by hand, and consecutive walks along corridors are shown as one step. The first step not yet done is highlighted.

The page measures "off course" as the ground distance from a reading to the drawn line. If two readings in a row are more than 75 metres from it, the page asks for the [nearest building](reaction:Campus.Routing.NearestPlace) and finds a new route from there to the same destination, with the same step-free choice and the current time. It then waits for two fresh readings before it can reroute again, since a person on the street can be more than 75 metres from a building's centre. When there is no nearest building or no new route, the page says so and keeps the old route. The request carries a latitude and longitude, which must be numbers (anything else is refused as an invalid request), and answers with the closest entrance from the [nearest-place former](former:Campus.Routing.Nearest), or nothing. A person's position is never stored; it is sent only to find the nearest building.

```endpoints
Campus.Routing.NearestPlace at /route/nearest
```

Searching and routing need no account, but flagging and clearing do, so every report belongs to a person (see [accounts](Accounts.md)). A signed-in person can [flag a connection as blocked](reaction:Campus.Problems.BlockLink) with a reason. The endpoint passes the session to `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and the person, never a request input, becomes the report's reporter. The flag takes effect in the connection itself, and the reporter and reason are kept as a report, so the two are recorded in one request. The request carries the session, the connection, and the reason, and answers with the report. The connection is blocked first, and the report is recorded only once the block has succeeded, so a refused block records nothing: an unknown connection is refused with NO_SUCH_LINK, and one that is already blocked with ALREADY_BLOCKED. Because every ride of one elevator shares a service, flagging any ride takes the whole elevator out, and flagging another ride of an elevator that is already out is refused with ALREADY_BLOCKED without a second report. If recording the report fails after the block, the connection stays blocked without a report; anyone can mark it clear and flag it again.

```endpoints
Campus.Problems.BlockLink at /problems/block
Campus.Problems.UnblockLink at /problems/unblock
```

Any signed-in person can [mark a connection as clear again](reaction:Campus.Problems.UnblockLink); the endpoint starts with `Sessioning.use` the same way. Clearing is not limited to the reporter, because a passage would otherwise stay blocked whenever its reporter is gone. Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Campus.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports. The request carries the session and the connection and answers with the connection; an unknown connection is refused with NO_SUCH_LINK, and one that is not blocked with NOT_BLOCKED. Clearing one ride of an elevator clears every ride that shares its service, so [clearing also resolves the reports on those rides](reaction:Campus.Problems.ClearingResolvesSharedReports); otherwise a report against another ride would stay open after the elevator is back.

The map itself is filled in by [adding places](reaction:Campus.Setup.AddPlace) and [connecting them](reaction:Campus.Setup.Connect). In this version these are run by a seed script, which loads the Simmons map and the campus map generated from MIT's room inventory and building footprints, rather than by visitors. Adding a place carries its name, kind, floor, and position; latitude and longitude are required, and the caller sends 0 for both when the position is unknown. It answers with the place, refusing a name already in use with DUPLICATE_PLACE; connecting carries both places and the connection's directions, step-free flag, closing hours, service, and distance and answers with the connection, refusing an unknown place with NO_SUCH_PLACE. These endpoints are deliberately open to anyone in this beta, because the seed script that fills the map runs without signing in; restricting map editing to staff is future work.

```endpoints
Campus.Setup.AddPlace at /map/add-place
Campus.Setup.Connect at /map/connect
```

## Retained review guidance

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/boundary.md**

Unchanged from the prior same-agent context.

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/contracts.md**

Unchanged from the prior same-agent context.

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/ssf-reading.md**

Unchanged from the prior same-agent context.

# Result

Unless the task requests another format, use these prior fields: `## Verdict`, `## Findings`.
