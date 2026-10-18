# Role and objective

Work unit `mit-nav`; role `critic`; phase `verification`.

# Critic verification

Verify only the supplied finding or routed-blocker IDs against the revised candidate and their direct effects. Mark each ID resolved, unresolved, or directly regressed.

Do not restart holistic review, add unrelated findings, edit the candidate, or infer missing context.

# Access

Root: "/Users/riceelijah/dev/classes/6104/simmons-nav". The short native message explicitly authorizes reading this prompt file; all assignment context is inline below. This is already a compiled role assignment: do not load a skill, workflow, harness guide, or another instruction file.

- Read: none.
- Write: none.
- Tools: none.
- Shell: `none`; network: no; generated output: no; long-running processes: no.

Inspect only listed files or directories. In coordinator simulation, this grant binds the coordinator itself; broader coordinator access and prior discovery are unavailable to the assignment. Project checks may transitively read other project files, but do not inspect them yourself. Use supplied or task-named package-owned public documentation; do not browse package trees. Never inspect package `dist`, framework internals, caches, sibling applications, or undeclared declarations. Exclude `.git`, `.sync-engine` except this prompt, harness/skill configuration, agent traces, parent directories, and unrelated generated output. Ask for context instead of searching outside the grant. Generated files come only from granted commands. Never grantable: `git-mutation`, `dependency-installation`, `framework-internals`, `workflow-management`, `skill-cli-invocation`, `delegation-or-handoff`.

# Guidance

No additional guidance for this phase.

# Context

## Verification task

**.sync-engine/work/mit-nav/tasks/critic-verify3.md**

Verify B-1 and M-1..M-4 from the blocked review against the revised Campus.md, Wayfinding.md and the brief.

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

## Original finding or routed blocker IDs

**.sync-engine/work/mit-nav/2026-10-18T22-07-35Z-critic-contracts.response.md**

## Verdict
Blocked

The search change follows the new decision that the browser never receives the whole map, but taking connections out of the overview breaks the accepted recovery path for flagging (B-1).

## Findings

- **B-1 (blocker): The accepted BlockLink recovery can no longer be reached.** A connection blocked without a report appears in neither the open-report list nor route steps, so "mark it clear and flag it again" has no reachable trigger; same for other rides of an elevator blocked through its shared service unless one carries the report. Need a way to see connections blocked without an open report, or a different recovery.
- **M-1: "Buildings first" does not match `_search`, which puts entrances first.** State entrances first, or that building places are ENTRANCE places.
- **M-2: The source of a connection to flag is not stated.** State that FindRoute's steps carry each connection and flagging starts from a route step.
- **M-3: `_link` declares the wrong cardinality.** One row or none: declare optional.
- **M-4: The new queries change the concept beyond what the brief's active decision allows.** `_search` and `_link` not named by the brief. Also state that a search with no matches is an empty answer, not a refusal.

## Revised candidate context

**design/compositions/Campus.md**

# MIT campus navigation

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks. Inside the buildings whose room lists have been converted, each floor is a corridor, joined to the floors above and below by the building's stairs and elevators, with the classrooms, labs, offices and other rooms a visitor looks for opening off it. Buildings that touch are joined indoors on the floors they share. Simmons Hall keeps its detailed hand-made map and joins the campus through its main lobby entrance. The campus has thousands of places and connections, so the app never sends the whole map to the browser. A visitor finds a place by typing part of its name: the [place search](former:Campus.Browsing.PlaceSearch) answers at most 40 matching places that can be a start or a destination, with entrances first (every building and the Simmons lobby are entrances), and the [search request](reaction:Campus.Browsing.SearchPlaces) carries the typed text and answers with those places; when nothing matches the answer is an empty list, not a refusal. Anyone can also see the problems reported so far: the [problem list](former:Campus.Browsing.ProblemList) lists open reports, each with the names of its connection's two places and its directions, and the [blocked list](former:Campus.Browsing.BlockedList) lists every blocked connection the same way, including any blocked without a report, so it can still be marked clear. The [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both lists. Generated place names begin with the building ("Building 32, floor 1", "32-123 Lecture Hall"), so typing a building or room number finds them.

```endpoints
Campus.Browsing.ShowOverview at /map/overview
Campus.Browsing.SearchPlaces at /map/search
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because some passages, such as terrace doors, are closed overnight. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps, each carrying the connection it uses, which is where a visitor starts when flagging a passage; when either place is unknown or no route exists, the answer is an empty list rather than a refusal.

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
_search(text: String) : many (place: Place, name: String, kind: Kind, floor: Number)
  Answers at most 40 places that are not TRANSIT whose name contains the text, ignoring case, with entrances first and then by name in natural number order (so 2 comes before 10); an empty text answers the first 40 places in that order, and no rows when nothing matches.
_link(link: Link) : optional (sourceName: String, destinationName: String, forward: String, service: String)
  Answers the names of the connection's two places, its forward directions, and its service when the link is known, and nothing otherwise.
_blocked() : many (link: Link, sourceName: String, destinationName: String, forward: String, service: String)
  Answers every blocked connection with the names of its two places, its forward directions, and its service, in the order the connections were made, and no rows when nothing is blocked.
_sameService(link: Link) : many (other: Link)
  Answers every other connection that shares the link's service, in the order the connections were made, and no rows when the link is unknown or its service is empty.
_route(source: Place, destination: Place, accessibleOnly: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, floor: Number)
  Answers the shortest route from source to destination, where each connection costs the distance it was given when it was made (so a builder can make a short flight of stairs cheaper than waiting for an elevator), as numbered steps starting at 1, never using a blocked connection or one that is closed at the given hour of the day (0 up to 24, so 6.5 is half past six in the morning), and when accessibleOnly is true never using a connection that is not accessible. Answers no rows when either place is unknown or no route exists, and one row per step in order otherwise. Ties are broken in favor of connections made earlier.
```

## Retained review guidance

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/boundary.md**

# What a design says about its boundary

An endpoint takes one request and produces one answer. Endpoints are the only way into
the application, and every caller reaches them the same way, regardless of caller.

Say what a caller supplies, what comes back, and every refusal with a stable code and its
meaning. Each selected endpoint separately declares its exact `endpoint(...)` pathname in
an `endpoints` fence. Do not put transport rendering in behavioral prose or that fence: no
methods, status codes, headers, exit codes, or projected external routes.

When two refusals have to be indistinguishable to a caller, say that as behaviour.

A concept needing the current time or a generated identifier says so in its prose and
takes it as an action input; it never reaches for a clock. Composition binds one instant
per flow and passes it in, so no concept reports the time.

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/contracts.md**

# Contract design and review

Use the supplied decomposition as boundary authority; without one, use the brief and affected approved contracts. Preserve accepted obligation IDs and their trigger, closing reaction, false interval, retry identity, and recovery.

## Concepts own complete mechanisms

Purpose names one mechanism and rules out a plausible alternative. Principle gives a short event-ordered story with real actors and values. State describes observable identity, relations, lifecycle, order, multiplicity, and invariants—not storage. External identities remain opaque and peer facts are never interpreted locally.

For every action, settle:

- inputs and returned identity;
- successful state transition;
- each expected refusal and the unchanged post-refusal state;
- repetition or deduplication behavior;
- lifecycle stage, deletion, expiry, and repair when applicable; and
- the owner action that enforces each race-sensitive or security-critical invariant.

A refusal has no partial effect. Repetition must succeed again, return the prior result, or refuse. Deduplication requires an operation identity accepted and checked atomically by the owner; a trace correlation ID is not enough.

Queries have no effects. State `one`, `optional`, or `many`, the empty or unknown case, and stable ordering for `many`. Do not invent CRUD symmetry or expose storage operations that are not part of the mechanism.

## Composition coordinates without stealing authority

Composition owns cross-concept policy, coordination, boundary adaptation, and recovery—not concept invariants. For each visible flow, state:

- actor and authenticated authority;
- requested resource and authorization condition;
- enforcement point;
- visible success and refusals;
- effect owner;
- ordering of required effects relative to acknowledgement; and
- material partial-failure and recovery behavior.

Request data is a claim, not authentication. Reject bypassable authorization, duplicate effect ownership, required work deferred after visible success when it can be lost, compensation without an available owner action, and claims of atomic or exactly-once behavior across independent owners.

For each obligation, verify that the trigger can occur, the closing reaction owns the intended effect, the owner accepts the retry identity, the false interval matches visible behavior, and recovery can run from an available action. This applies to synchronously awaited endpoint steps as well as deferred reactions. Never assume rollback between owners or exactly-once network delivery. Choose and state a realizable server-side acknowledgement boundary rather than adding protocol state solely to model whether a client received bytes.

## Select every executable explicitly

Inventory each selected static instance, endpoint, internal reaction, view, former, and computation. Give every executable declaration one exact typed link, and put all concrete types and instances needed by a new application in `design/types.md`. Each endpoint additionally needs exactly one matching `Declaration.Identity at /path` entry. The module, group, declaration, and pathname must agree.

A computation is a pure derivation of its declared inputs, such as normalization, a generated identifier, the current instant, or deciding whether an optional input was supplied. Anything read from concept state belongs in a query, view, or former, never a computation. Declare every computation the composition prose implies before review, including one for each optional-input branch. Implementation blocks on a missing declaration rather than inventing one.

An endpoint-linked reaction may own the full coordination required before its answer. Add a separate internal reaction only for intentionally distinct deferred or independently triggered behavior. Do not duplicate one effect in both declarations.

Contracts specify behavior, ownership, acknowledgement, and failure—not framework stages, trigger syntax, binding flow, host methods, status codes, or storage layout.

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/ssf-reading.md**

# Reading Simple State Form

State fences are declarations, not storage. Read them for what they promise:

- `a set of Items` and `a seq of Items` introduce identities; a `seq` also fixes order.
- A plain set holds every individual of its type in the state: with `a set of Users with
a reputation Number`, every User anywhere in the concept has a reputation, whether
  User is owned or external. An external type's set introduces no identity.
- `a set of Completed Items` classifies members of `Items`, and `a set of Late Completed
Items` members of `Completed Items`. A subset declares no second collection and no
  identity, subsets may overlap, and `a reviewer Verified User` holds only members of
  `Verified Users`.
- `an Author` is the field `author`; the type names a field written without a name.
- `an optional owner Person` may be absent. Collections never carry `optional`; empty
  means absent, so a set that must reject duplicates cannot also promise to detect them.
- `a Settings` has exactly one member.
- `alias WorkItem for Items` renames one declaration; it adds nothing.
- A `Rule:` line is prose the checker keeps verbatim and proves nothing.

Which side declares a relation implies no storage, navigation, or ownership.

# Result

Unless the task requests another format, return these headings in order. Omit progress narration.

- `## Verdict` — required. First line is exactly `Approve`, `Revise`, or `Blocked`.
- `## Findings` — required. Stable findings or routed blockers resolved/unresolved; direct regressions or none.
