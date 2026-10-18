# Role and objective

Work unit `live-navigation`; role `critic`; phase `contracts`.

# Contract critic

Independently review the complete changed contract set after authored syntax validation. Use the brief, affected approved contracts, and supplied decomposition as authority.

Check scope, sole mechanism ownership, opaque peer identities, action success and refusal state, repetition, lifecycle, query cardinality and ordering, authorization enforcement, effect ownership, acknowledgement order, and recoverable obligations.

Record one compact assessment row per affected obligation covering trigger, closing reaction, visible success, false interval, acknowledgement order, retry identity, whether the owner accepts that identity, recovery action, and duplicate-effect risk. Inventory selected endpoints, internal reactions, views, formers, computations, links, and endpoint paths. Check that every derived value or optional-input branch implied by the prose has exactly one declared computation and that no computation depends on concept state.

Missing authority, bypassable authorization, duplicate ownership, unrecoverable required work, or behavior required for visible success/refusal is a blocker. When the brief or decomposition requires endpoints, links, or cross-concept behavior, the absence of an application contract in supplied or granted design is a blocker. Return a `Blocked` verdict for that absence, not `Approve` with a note. Give other consequential mismatches stable material-finding IDs. Ignore naming polish, parser mechanics, implementation staging, and unrelated pre-existing issues.

Do not edit design, prescribe implementation, or infer missing context.

# Access

Root: "/Users/riceelijah/dev/classes/6104/simmons-nav". The short native message explicitly authorizes reading this prompt file; all assignment context is inline below. This is already a compiled role assignment: do not load a skill, workflow, harness guide, or another instruction file.

- Read: none.
- Write: none.
- Tools: none.
- Shell: `none`; network: no; generated output: no; long-running processes: no.

Inspect only listed files or directories. In coordinator simulation, this grant binds the coordinator itself; broader coordinator access and prior discovery are unavailable to the assignment. Project checks may transitively read other project files, but do not inspect them yourself. Use supplied or task-named package-owned public documentation; do not browse package trees. Never inspect package `dist`, framework internals, caches, sibling applications, or undeclared declarations. Exclude `.git`, `.sync-engine` except this prompt, harness/skill configuration, agent traces, parent directories, and unrelated generated output. Ask for context instead of searching outside the grant. Generated files come only from granted commands. Never grantable: `git-mutation`, `dependency-installation`, `framework-internals`, `workflow-management`, `skill-cli-invocation`, `delegation-or-handoff`.

# Guidance

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

---

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

---

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

# Context

## Review task

**.sync-engine/work/live-navigation/tasks/critic.md**

Review the live-navigation design (Wayfinding positions and _nearest; Campus NearestPlace endpoint and the client-side tracking/rerouting prose) against the brief. Report Verdict with numbered findings.

## Brief

**.sync-engine/work/live-navigation/brief.md**

# Live navigation: map, location tracking, rerouting

## Goal

Show the route on a map, and, when a person turns on location, follow their progress: finished steps grey out, the next step is highlighted, and going off course reroutes them from where they are.

## Scope

- Included: a position (latitude, longitude) for every place; a query for the nearest building to a position; step positions in route answers and place positions in search answers; the converter and seed supplying positions; a Leaflet map (from a pinned CDN version, OSM tiles) drawing the route, start, end and the person's position; opt-in geolocation that ticks off outdoor steps when the person reaches each step's place, a "Done" button to advance indoor steps by hand, and automatic rerouting from the nearest building after two readings more than 75 m from the route.
- Excluded: indoor positioning (GPS does not work indoors), turn-by-turn voice, storing locations on the server (positions never leave the browser except the one sent to find the nearest building when rerouting).

## Requirements

- Every place has a position; rooms and floors share their building's position, and Simmons places share Simmons Hall's.
- `_nearest(latitude, longitude)` answers the closest entrance (building) by straight-line distance, or nothing when no place has a position.
- Route steps carry the latitude and longitude of the place they arrive at; search results carry positions.
- Location stays off unless the person turns it on (or their saved preference says to use it); turning it off stops watching.
- Rerouting never happens from a single noisy reading.

## Active decisions

- Positions are building centres (OpenStreetMap footprint centroids, MapIT centres where OSM has no outline), which is enough to draw and follow outdoor legs; indoor steps cannot be tracked and are advanced by hand.
- A place added without a known position gets latitude and longitude 0 and is treated as having none.
- Leaflet 1.9.4 from unpkg and OpenStreetMap's public tiles, with attribution; no new npm dependency.
- Execution mixed: designer and implementation simulated; contract critic delegated to a fresh Claude Code agent.

## Done when

- check:design, generate, check pass; tests cover `_nearest` (closest, ties, none), positions through addPlace, route and search answers.
- In the browser the map draws the Simmons → 32-123 route; with a simulated position the first outdoor step greys out and the next is highlighted; a simulated off-course position reroutes from the nearest building.

## Open questions

None.

## Activity

- Work item started.

## Changed candidate contracts

**design/compositions/Campus.md**

# MIT campus navigation

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks. Inside the buildings whose room lists have been converted, each floor is a corridor, joined to the floors above and below by the building's stairs and elevators, with the classrooms, labs, offices and other rooms a visitor looks for opening off it. Buildings that touch are joined indoors on the floors they share. Simmons Hall keeps its detailed hand-made map and joins the campus through its main lobby entrance. The campus has thousands of places and connections, so the app never sends the whole map to the browser. A visitor finds a place by typing part of its name: the [place search](former:Campus.Browsing.PlaceSearch) answers at most 40 matching places that can be a start or a destination, with entrances first (every building and the Simmons lobby are entrances), and the [search request](reaction:Campus.Browsing.SearchPlaces) carries the typed text and answers with those places; when nothing matches the answer is an empty list, not a refusal. Anyone can also see the problems reported so far: the [problem list](former:Campus.Browsing.ProblemList) lists open reports, each with the reporter's username from `Registering._username` (a report whose reporter has no username, such as one made before accounts existed, is still listed, with no name, so an open problem is never hidden), the names of its connection's two places and its directions, and the [blocked list](former:Campus.Browsing.BlockedList) lists every blocked connection the same way, including any blocked without a report, so it can still be marked clear. The [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both lists. Generated place names begin with the building ("Building 32, floor 1", "32-123 Lecture Hall"), so typing a building or room number finds them.

```endpoints
Campus.Browsing.ShowOverview at /map/overview
Campus.Browsing.SearchPlaces at /map/search
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because some passages, such as terrace doors, are closed overnight. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps, each carrying the connection it uses, which is where a visitor starts when flagging a passage; when either place is unknown or no route exists, the answer is an empty list rather than a refusal.

```endpoints
Campus.Routing.FindRoute at /route/find
```

Every place has a position: a building's is the centre of its outline, and its floors and rooms share it, as Simmons Hall's places share Simmons Hall's. Each route step and each search result carries a position, so the page draws the route on a map. When the person turns on their location, the page follows their progress itself: a step whose place they reach is marked done and the next one is highlighted, and steps inside a building, where a phone cannot tell where it is, are marked done by hand. If two readings in a row are more than 75 metres from the route, the page asks for the [nearest building](reaction:Campus.Routing.NearestPlace) to where the person is and finds a new route from there. That request carries a latitude and longitude and answers with the closest entrance, from the [nearest-place former](former:Campus.Routing.Nearest), or nothing when no place has a position. A person's position is never stored; it is sent only to find the nearest building.

```endpoints
Campus.Routing.NearestPlace at /route/nearest
```

Searching and routing need no account, but flagging and clearing do, so every report belongs to a person (see [accounts](Accounts.md)). A signed-in person can [flag a connection as blocked](reaction:Campus.Problems.BlockLink) with a reason. The endpoint passes the session to `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and the person, never a request input, becomes the report's reporter. The flag takes effect in the connection itself, and the reporter and reason are kept as a report, so the two are recorded in one request. The request carries the session, the connection, and the reason, and answers with the report. The connection is blocked first, and the report is recorded only once the block has succeeded, so a refused block records nothing: an unknown connection is refused with NO_SUCH_LINK, and one that is already blocked with ALREADY_BLOCKED. Because every ride of one elevator shares a service, flagging any ride takes the whole elevator out, and flagging another ride of an elevator that is already out is refused with ALREADY_BLOCKED without a second report. If recording the report fails after the block, the connection stays blocked without a report; anyone can mark it clear and flag it again.

```endpoints
Campus.Problems.BlockLink at /problems/block
Campus.Problems.UnblockLink at /problems/unblock
```

Any signed-in person can [mark a connection as clear again](reaction:Campus.Problems.UnblockLink); the endpoint starts with `Sessioning.use` the same way. Clearing is not limited to the reporter, because a passage would otherwise stay blocked whenever its reporter is gone. Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Campus.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports. The request carries the session and the connection and answers with the connection; an unknown connection is refused with NO_SUCH_LINK, and one that is not blocked with NOT_BLOCKED. Clearing one ride of an elevator clears every ride that shares its service, so [clearing also resolves the reports on those rides](reaction:Campus.Problems.ClearingResolvesSharedReports); otherwise a report against another ride would stay open after the elevator is back.

The map itself is filled in by [adding places](reaction:Campus.Setup.AddPlace) and [connecting them](reaction:Campus.Setup.Connect). In this version these are run by a seed script, which loads the Simmons map and the campus map generated from MIT's room inventory and building footprints, rather than by visitors. Adding a place carries its name, kind, floor, and position (latitude and longitude, both 0 when unknown) and answers with the place, refusing a name already in use with DUPLICATE_PLACE; connecting carries both places and the connection's directions, step-free flag, closing hours, service, and distance and answers with the connection, refusing an unknown place with NO_SUCH_PLACE. These endpoints are deliberately open to anyone in this beta, because the seed script that fills the map runs without signing in; restricting map editing to staff is future work.

```endpoints
Campus.Setup.AddPlace at /map/add-place
Campus.Setup.Connect at /map/connect
```

**design/concepts/Registering.md**

# Registering

## Purpose

Let people choose a username that others can find them by.

*Prevents:* two people end up with the same username.

## Principle

Maya registers the username `maya`. When Sam types `maya`, Registering returns Maya's user, and her username appears beside the files she shares with him. Ben tries to register `maya` too, and is refused with "That username is taken.", so he registers `ben`.

## Types

```types
```

## State

```state
a set of Users with
  a unique username String
```

## Actions

```actions
register(username: String) : returns (user: User)
  where username is not 3 to 32 ASCII letters, digits, underscores, or hyphens
  then
    refuses INVALID_USERNAME "A username must have 3 to 32 letters, digits, underscores, or hyphens."
  where some user has username
  then
    refuses USERNAME_TAKEN "That username is taken."
  where username is accepted and no user has username
  then
    add a new user with username
    returns user
```

## Queries

```queries
_byUsername(username: String) : optional (user: User)
  Returns the user with exactly this username, or no row when nobody has it.

_username(user: User) : optional (username: String)
  Returns the user's username, or no row for an unknown user.
```

**design/concepts/Reporting.md**

# Reporting

## Purpose

Remember who reported a problem with something and why, so others can see what is wrong and when it has been dealt with.

## Principle

Barish reports the elevator as out of service because the doors will not close. Others can see the open report and its reason. Once the problem is resolved, the report no longer appears among the open ones but is still kept.

## Types

```types
external User
  The person who makes a report.

external Target
  The thing a report is about.

Status is OPEN or RESOLVED
  Whether the problem is still outstanding.
```

## State

```state
a set of Reports with
  a reporter User
  a target Target
  a reason String
  a status Status
```

## Actions

```actions
report(reporter: User, target: Target, reason: String) : returns (report: Report)
  where true
  then
    add a new report with reporter and target and reason, with status OPEN
    returns report

resolve(target: Target) : returns ()
  where true
  then
    set the status of every open report about target to RESOLVED
    returns
```

## Queries

```queries
_open() : many (report: Report, reporter: User, target: Target, reason: String)
  Answers every report whose status is OPEN, in the order they were made, and no rows when there are none.
_about(target: Target) : many (report: Report, reporter: User, reason: String, status: Status)
  Answers every report about the target, open or resolved, in the order they were made.
```

**design/concepts/Sessioning.md**

# Sessioning

## Purpose

Let people stay signed in across requests without sending their password each time.

*Prevents:* someone keeps using a session after signing out; someone who finds a session left open on a shared computer, or copies one, keeps using it indefinitely; someone who comes back after a few days has to sign in again.

## Principle

After Maya proves who she is, a session is started for her. Each time she sends a request with the session, Sessioning returns her as the person it belongs to and records when she last used it. When she signs out, the session ends, and any later request that carries it is refused. She forgets to sign out on a library computer; nobody uses that session for a week, and then it is refused. She uses the session on her own laptop every day, but three months after it started, that one is refused too, and she signs in again.

## Types

```types
external Subject
  The person a session belongs to.
```

## State

```state
a set of Sessions with
  a Subject
  a lastUsed DateTime
  an expiresAt DateTime

Rule: a session's identity is unguessable, and it is all a person sends to use the session.
Rule: Sessioning may delete a session at any time once it can no longer be used.
```

## Actions

```actions
start(subject: Subject) : returns (session: Session, expiresAt: DateTime)
  where true
  then
    add a new session for subject, last used now, that expires 90 days from now
    returns session, expiresAt

use(session: Session) : returns (subject: Subject)
  where session is unknown, has not been used for 7 days, or has expired
  then
    refuses NOT_SIGNED_IN "Your session has ended. Sign in again."
  where session was used within the last 7 days and has not expired
  then
    set the session's lastUsed to now
    returns subject

end(session: Session) : returns (session: Session)
  where session is unknown, has not been used for 7 days, or has expired
  then
    refuses NOT_SIGNED_IN "Your session has ended. Sign in again."
  where session was used within the last 7 days and has not expired
  then
    remove session
    returns session
```

## Queries

```queries
```

**design/concepts/Wayfinding.md**

# Wayfinding

## Purpose

Describe how the places on a campus connect, from buildings and outdoor walks down to the floors, stairs, elevators and rooms inside them, so a visitor can be given directions that avoid any passage that is currently unusable.

## Principle

Someone adds the lobby and a room on the second floor, each with where it is on the map, and connects them by an elevator and by a staircase. A visitor who needs a step-free route is sent by the elevator, and one who does not is sent by whichever connection is shortest. When the elevator is blocked, the step-free visitor is told that no route exists, while everyone else is still sent by the stairs. Once the elevator is unblocked, it is offered again. A door onto a terrace that is closed overnight is offered during the day and never offered at 2 in the morning.

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
  a latitude Number
  a longitude Number

  Rule: a place whose latitude and longitude are both 0 has no known position

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
addPlace(name: String, kind: Kind, floor: Number, latitude: Number, longitude: Number) : returns (place: Place)
  where some place has name
  then
    refuses DUPLICATE_PLACE "A place with that name already exists."
  where no place has name
  then
    add a new place with name and kind and floor and latitude and longitude
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
_place(place: Place) : optional (name: String, kind: Kind, floor: Number, latitude: Number, longitude: Number)
  Answers the place's name, kind, floor and position when the place is known, and nothing otherwise.
_nearest(latitude: Number, longitude: Number) : optional (place: Place, name: String, latitude: Number, longitude: Number)
  Answers the entrance with a known position closest to the given position in straight-line distance, the one added first on a tie, and nothing when no entrance has a known position.
_search(text: String) : many (place: Place, name: String, kind: Kind, floor: Number, latitude: Number, longitude: Number)
  Answers at most 40 places that are not TRANSIT whose name contains the text, ignoring case, with entrances first and then by name in natural number order (so 2 comes before 10); an empty text answers the first 40 places in that order, and no rows when nothing matches.
_link(link: Link) : optional (sourceName: String, destinationName: String, forward: String, service: String)
  Answers the names of the connection's two places, its forward directions, and its service when the link is known, and nothing otherwise.
_blocked() : many (link: Link, sourceName: String, destinationName: String, forward: String, service: String)
  Answers every blocked connection with the names of its two places, its forward directions, and its service, in the order the connections were made, and no rows when nothing is blocked.
_sameService(link: Link) : many (other: Link)
  Answers every other connection that shares the link's service, in the order the connections were made, and no rows when the link is unknown or its service is empty.
_route(source: Place, destination: Place, accessibleOnly: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, floor: Number, distance: Number, latitude: Number, longitude: Number)
  Answers the shortest route from source to destination, where each connection costs the distance it was given when it was made (so a builder can make a short flight of stairs cheaper than waiting for an elevator), as numbered steps starting at 1, each with the distance its connection was given and the position of the place it arrives at, never using a blocked connection or one that is closed at the given hour of the day (0 up to 24, so 6.5 is half past six in the morning), and when accessibleOnly is true never using a connection that is not accessible. Answers no rows when either place is unknown or no route exists, and one row per step in order otherwise. Ties are broken in favor of connections made earlier.
```

**design/types.md**

# Application types

Every person is a Registering user, whether they signed up with a password or signed in with their Commons class account. That user is the one who has a password in Authenticating, the one a Commons account is linked to in CommonsFederating, and the one a session belongs to. The same user is the reporter of a problem, the owner of favorites and saved trips, the traveller in the trip journal, and the person whose preferences are kept.

A problem is always reported about a connection between two places, so a report's target is a Wayfinding link. Favorites, saved trips and journal entries are about Wayfinding places.

```instances
instantiate Wayfinding

instantiate Registering

instantiate Authenticating with
  User is Registering.User

instantiate Federating as CommonsFederating with
  User is Registering.User

instantiate Sessioning with
  Subject is Registering.User

instantiate Reporting with
  User is Registering.User
  Target is Wayfinding.Link

instantiate Favoriting with
  User is Registering.User
  Item is Wayfinding.Place

instantiate Planning with
  User is Registering.User
  Place is Wayfinding.Place

instantiate Journaling with
  User is Registering.User
  Place is Wayfinding.Place

instantiate Preferring with
  User is Registering.User
```

# Result

Unless the task requests another format, return these headings in order. Omit progress narration.

- `## Verdict` — required. First line is exactly `Approve`, `Revise`, or `Blocked`.
- `## Assessments` — required. Compact obligation-by-obligation semantic assessment; do not restate contracts.
- `## Findings` — required. Stable-ID blocker or material findings, or none.
