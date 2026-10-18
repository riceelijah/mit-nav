# Role and objective

Continue work unit `mit-nav`; role `critic`; phase `verification`. The prior same-phase role contract remains authoritative.

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

**.sync-engine/work/mit-nav/tasks/critic-verify2.md**

Verify M-4 and R-1 from the previous verification against the revised Campus.md, Wayfinding.md and the brief's Active decisions.

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

## Original finding or routed blocker IDs

**.sync-engine/work/mit-nav/2026-10-18T21-53-56Z-critic-verification.response.md**

## Verdict
Revise

Four of the six findings are resolved (M-1, M-2, M-3, M-6) and M-5 is resolved by explicit acceptance. M-4 is only partly fixed: the refusals still have no stable codes. The repair for M-2 also directly caused one regression: it adds a query to the Wayfinding concept, which the brief says must not change apart from its purpose and principle prose.

## Findings

- **M-1: Resolved.** BlockLink blocks first and records the report only after the block succeeds; recovery by clear-and-reflag works with existing actions.
- **M-2: Resolved, but the fix caused regression R-1.** Residual, not blocking: neither resolve reaction states recovery if lost after the answer; pre-existing gap.
- **M-3: Resolved.**
- **M-4: Partly unresolved.** Inputs and answers stated; FindRoute empty answer stated. Still open: refusals described only as "not found" and "conflict"; each endpoint's refusals need a stable code and meaning, e.g. NO_SUCH_LINK, ALREADY_BLOCKED, NOT_BLOCKED, DUPLICATE_PLACE, NO_SUCH_PLACE.
- **M-5: Resolved by acceptance.** Grouping by building depends on a place-naming convention not in the contract.
- **M-6: Resolved.** M-1, M-3, M-4 pre-existing.
- **R-1: Direct regression from the M-2 repair.** `Wayfinding._sameService` contradicts the brief's decision that concept contracts are unchanged except prose. Either remove it and derive siblings in the composition, or record a brief decision allowing the concept change.

## Revised candidate context

**design/compositions/Campus.md**

# MIT campus navigation

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks. Inside the buildings whose room lists have been converted, each floor is a corridor, joined to the floors above and below by the building's stairs and elevators, with the classrooms, labs, offices and other rooms a visitor looks for opening off it. Buildings that touch are joined indoors on the floors they share. Simmons Hall keeps its detailed hand-made map and joins the campus through its main lobby entrance. Anyone can open the app and see the places and connections that make up the campus and the problems reported so far. The [overview](former:Campus.Browsing.Overview) lists places and connections, the [problem list](former:Campus.Browsing.ProblemList) lists open reports, and the [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both. Places come in the order Wayfinding keeps them (by floor, then the order they were added), so the client groups them by building for the picker, using the generated names, which begin with the building ("Building 32, floor 1", "32-123 Lecture Hall").

```endpoints
Campus.Browsing.ShowOverview at /map/overview
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because some passages, such as terrace doors, are closed overnight. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps; when either place is unknown or no route exists, the answer is an empty list rather than a refusal.

```endpoints
Campus.Routing.FindRoute at /route/find
```

Anyone can [flag a connection as blocked](reaction:Campus.Problems.BlockLink) with their name and a reason. The flag takes effect in the connection itself, and the name and reason are kept as a report, so the two are recorded in one request. The request carries the connection, the reporter's name, and the reason, and answers with the report. The connection is blocked first, and the report is recorded only once the block has succeeded, so a refused block records nothing: an unknown connection is refused with NO_SUCH_LINK, and one that is already blocked with ALREADY_BLOCKED. Because every ride of one elevator shares a service, flagging any ride takes the whole elevator out, and flagging another ride of an elevator that is already out is refused with ALREADY_BLOCKED without a second report. If recording the report fails after the block, the connection stays blocked without a report; anyone can mark it clear and flag it again.

```endpoints
Campus.Problems.BlockLink at /problems/block
Campus.Problems.UnblockLink at /problems/unblock
```

Anyone can [mark a connection as clear again](reaction:Campus.Problems.UnblockLink). Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Campus.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports. The request carries the connection and answers with it; an unknown connection is refused with NO_SUCH_LINK, and one that is not blocked with NOT_BLOCKED. Clearing one ride of an elevator clears every ride that shares its service, so [clearing also resolves the reports on those rides](reaction:Campus.Problems.ClearingResolvesSharedReports); otherwise a report against another ride would stay open after the elevator is back.

The map itself is filled in by [adding places](reaction:Campus.Setup.AddPlace) and [connecting them](reaction:Campus.Setup.Connect). In this version these are run by a seed script, which loads the Simmons map and the campus map generated from MIT's room inventory and building footprints, rather than by visitors. Adding a place carries its name, kind, and floor and answers with the place, refusing a name already in use with DUPLICATE_PLACE; connecting carries both places and the connection's directions, step-free flag, closing hours, service, and distance and answers with the connection, refusing an unknown place with NO_SUCH_PLACE. Because this version has no accounts, these endpoints are open to anyone who calls them; restricting them belongs with sign-in.

```endpoints
Campus.Setup.AddPlace at /map/add-place
Campus.Setup.Connect at /map/connect
```

**design/concepts/Wayfinding.md**

# Wayfinding

## Purpose

Describe how the places on a campus connect, from buildings and outdoor walks down to the floors, stairs, elevators and rooms inside them, so a visitor can be given directions that avoid any passage that is currently unusable.

## Principle

Someone adds the lobby and a room on the second floor and connects them by an elevator and by a staircase. A visitor who needs a step-free route is sent by the elevator, and one who does not is sent by whichever connection is shortest. When the elevator is blocked, the step-free visitor is told that no route exists, while everyone else is still sent by the stairs. Once the elevator is unblocked, it is offered again. A door onto a terrace that is closed overnight is offered during the day and never offered at 2 in the morning.

## Types

```types
Kind is ENTRANCE or HALLWAY or ROOM or TRANSIT
  What sort of place something is, so a visitor can tell a doorway from a destination. A TRANSIT place is only passed through and is never offered as a start or a destination.
```

## State

```state
a set of Places with
  a unique name String
  a kind Kind
  a floor Number

a seq of Links with
  a source Place
  a destination Place
  a forward String
  a backward String
  an accessible Flag
  a blocked Flag
  a closedFrom Number
  a closedUntil Number
  a service String
  a distance Number

  Rule: connections that share the same non-empty service are blocked and unblocked together, because they depend on one thing that can go out of service, such as an elevator
  Rule: a connection is closed from closedFrom up to closedUntil, in hours from 0 up to 24, wrapping past midnight when closedFrom is greater than closedUntil; when the two are equal the connection is never closed
```

## Actions

```actions
addPlace(name: String, kind: Kind, floor: Number) : returns (place: Place)
  where some place has name
  then
    refuses DUPLICATE_PLACE "A place with that name already exists."
  where no place has name
  then
    add a new place with name and kind and floor
    returns place

connect(source: Place, destination: Place, forward: String, backward: String, accessible: Flag, closedFrom: Number, closedUntil: Number, service: String, distance: Number) : returns (link: Link)
  where source not in places or destination not in places
  then
    refuses NO_SUCH_PLACE "Both places must exist before they can be connected."
  where source in places and destination in places
  then
    add a new link with source and destination and forward and backward and accessible and closedFrom and closedUntil and service and distance, not blocked
    returns link

block(link: Link) : returns (link: Link)
  where link not in links
  then
    refuses NO_SUCH_LINK "There is no such connection."
  where link in links and link is blocked
  then
    refuses ALREADY_BLOCKED "That connection is already blocked."
  where link in links and link is not blocked
  then
    mark link as blocked, and every other link with the same non-empty service
    returns link

unblock(link: Link) : returns (link: Link)
  where link not in links
  then
    refuses NO_SUCH_LINK "There is no such connection."
  where link in links and link is not blocked
  then
    refuses NOT_BLOCKED "That connection is not blocked."
  where link in links and link is blocked
  then
    mark link as not blocked, and every other link with the same non-empty service
    returns link
```

## Queries

```queries
_places() : many (place: Place, name: String, kind: Kind, floor: Number)
  Answers every place, ordered by floor and then in the order the places were added (so whoever builds the map can list a floor's places from the entrance outward), and no rows when there are none.
_links() : many (link: Link, sourceName: String, destinationName: String, forward: String, accessible: Flag, blocked: Flag, closedFrom: Number, closedUntil: Number, service: String)
  Answers every connection with the names of its two places, in the order the connections were made.
_sameService(link: Link) : many (other: Link)
  Answers every other connection that shares the link's service, in the order the connections were made, and no rows when the link is unknown or its service is empty.
_route(source: Place, destination: Place, accessibleOnly: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, floor: Number)
  Answers the shortest route from source to destination, where each connection costs the distance it was given when it was made (so a builder can make a short flight of stairs cheaper than waiting for an elevator), as numbered steps starting at 1, never using a blocked connection or one that is closed at the given hour of the day (0 up to 24, so 6.5 is half past six in the morning), and when accessibleOnly is true never using a connection that is not accessible. Answers no rows when either place is unknown or no route exists, and one row per step in order otherwise. Ties are broken in favor of connections made earlier.
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
