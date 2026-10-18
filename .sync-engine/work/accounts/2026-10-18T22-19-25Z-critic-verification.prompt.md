# Role and objective

Work unit `accounts`; role `critic`; phase `verification`.

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

**.sync-engine/work/accounts/tasks/critic-verify.md**

Verify M-01..M-07 against the revised Campus.md, Saved.md, Passwords.md and the brief's active decisions.

## Brief

**.sync-engine/work/accounts/brief.md**

# Accounts, account-linked reports, and saved things

## Goal

People sign in (Commons class account or password), reports belong to the signed-in account, and a signed-in person can keep favorite places, saved trips, preferences, and a history of finished trips with totals (trip count and estimated distance).

## Scope

- Included: ConceptBox's Registering, Authenticating, Sessioning, Federating (as CommonsFederating) and its accounts/passwords/commons compositions, copied per ConceptBox's README; Reporting's User becomes Registering.User; flagging and clearing require a session; new concepts Favoriting, Planning, Journaling, Preferring with endpoints; `_route` steps also answer each connection's distance; frontend sign-in (password form, Commons button and callback), and panels for favorites, saved trips, preferences, history and totals; tests.
- Excluded: location tracking, rerouting, the map view (next work item); deployment.

## Requirements

- Anyone can still search places and get routes without signing in.
- Flagging a passage requires a session; the report's reporter is the session's user, never a request input. Clearing requires a session; any signed-in person may clear.
- Open reports show the reporter's username.
- A signed-in person can favorite a place (once each) and unfavorite it; save a named trip (source, destination, step-free) with names unique per person, and remove only their own; set preferences (step-free by default, use my location); finish a trip, which records source, destination and estimated metres; read their history (newest first) and totals.
- Nobody can read or change another person's favorites, trips, preferences or history: every such endpoint reads the user from the session.
- Password sign-up and Commons sign-in both work locally; PUBLIC_ORIGIN sets the cookie origin.

## Active decisions

- Sign-in by both Commons and password (user's choice), copied from ConceptBox rather than written fresh.
- Any signed-in person may mark a passage clear; restricting clearing to the reporter would leave a passage blocked when the reporter is gone.
- Estimated distance comes from route costs (an outdoor walk costs 1 + metres/50, so 50 m per unit of cost); the client sums a finished route's step distances and sends them. The figure is an estimate and is labelled as one.
- Tests move from the hand-written fake Mongo to mongodb-memory-server (a new dev dependency, as ConceptBox uses), so the copied concepts run on real MongoDB semantics.
- Copied ConceptBox concepts keep reading the clock themselves, and Commons.md keeps its HTTP categories and Referrer-Policy prose, as ConceptBox ships them; accepted deviation so the copies stay identical to the course's reference.
- Finished-trip distances are estimates; a duplicate finish (retry or double fire) would add a second entry. Accepted: the page sends one finish per route, and totals are labelled as estimates.
- AddPlace and Connect stay open without sign-in in this beta because the seed script fills the map; restricting map editing to staff is future work.
- Execution mixed: designer and workers simulated by the coordinator; contract critic delegated to a fresh Claude Code agent.

## Done when

- `bun run check:design`, `bun run generate`, `bun run check` pass.
- `bun test` passes, including ConceptBox's concept tests for the copied concepts, tests for each new concept's principle and refusals, and HTTP tests: sign up, flag with session, reporter is the username, another user cannot remove someone else's trip, endpoints refuse without a session.
- In the local app: sign up with a password, flag and clear, favorite a place, save and reuse a trip, toggle step-free default, finish a trip and see totals.

## Open questions

None.

## Activity

- Work item started.

## Original finding or routed blocker IDs

**.sync-engine/work/accounts/2026-10-18T22-17-29Z-critic-contracts.response.md**

## Verdict
Revise

No blockers. Every endpoint has an application contract; each Saved and Campus Problems endpoint starts with `Sessioning.use` and none takes a person as input. The new concepts are complete mechanisms.

## Findings

- **M-01:** ProblemList doesn't say what happens when a reporter has no username (`Registering._username` is optional; older reports have non-Registering reporters). Dropping them would hide an open report.
- **M-02:** Unclear who converts route distance to metres; if the endpoint converts a computation is needed. Say plainly the request carries metres the page converted.
- **M-03:** FinishTrip has no retry identity; a retry or double fire inflates totals. Accept explicitly or deduplicate.
- **M-04:** Password Register can leave an orphan account with no recovery if set/start fails after register; Passwords.md doesn't state it.
- **M-05:** Favorite, SaveTrip, FinishTrip accept unknown places then hide them; totals and history can disagree. Refuse unknown places or state a consistent rule.
- **M-06:** Campus Setup rationale ("no accounts") is out of date.
- **M-07:** Copied concepts read the clock themselves and Commons.md has transport details in prose; record as an accepted deviation.

## Revised candidate context

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

Searching and routing need no account, but flagging and clearing do, so every report belongs to a person (see [accounts](Accounts.md)). A signed-in person can [flag a connection as blocked](reaction:Campus.Problems.BlockLink) with a reason. The endpoint passes the session to `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and the person, never a request input, becomes the report's reporter. The flag takes effect in the connection itself, and the reporter and reason are kept as a report, so the two are recorded in one request. The request carries the session, the connection, and the reason, and answers with the report. The connection is blocked first, and the report is recorded only once the block has succeeded, so a refused block records nothing: an unknown connection is refused with NO_SUCH_LINK, and one that is already blocked with ALREADY_BLOCKED. Because every ride of one elevator shares a service, flagging any ride takes the whole elevator out, and flagging another ride of an elevator that is already out is refused with ALREADY_BLOCKED without a second report. If recording the report fails after the block, the connection stays blocked without a report; anyone can mark it clear and flag it again.

```endpoints
Campus.Problems.BlockLink at /problems/block
Campus.Problems.UnblockLink at /problems/unblock
```

Any signed-in person can [mark a connection as clear again](reaction:Campus.Problems.UnblockLink); the endpoint starts with `Sessioning.use` the same way. Clearing is not limited to the reporter, because a passage would otherwise stay blocked whenever its reporter is gone. Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Campus.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports. The request carries the session and the connection and answers with the connection; an unknown connection is refused with NO_SUCH_LINK, and one that is not blocked with NOT_BLOCKED. Clearing one ride of an elevator clears every ride that shares its service, so [clearing also resolves the reports on those rides](reaction:Campus.Problems.ClearingResolvesSharedReports); otherwise a report against another ride would stay open after the elevator is back.

The map itself is filled in by [adding places](reaction:Campus.Setup.AddPlace) and [connecting them](reaction:Campus.Setup.Connect). In this version these are run by a seed script, which loads the Simmons map and the campus map generated from MIT's room inventory and building footprints, rather than by visitors. Adding a place carries its name, kind, and floor and answers with the place, refusing a name already in use with DUPLICATE_PLACE; connecting carries both places and the connection's directions, step-free flag, closing hours, service, and distance and answers with the connection, refusing an unknown place with NO_SUCH_PLACE. These endpoints are deliberately open to anyone in this beta, because the seed script that fills the map runs without signing in; restricting map editing to staff is future work.

```endpoints
Campus.Setup.AddPlace at /map/add-place
Campus.Setup.Connect at /map/connect
```

**design/compositions/Passwords.md**

# Passwords

Ben has no Commons account, so he signs up with a username and a password. Registering stores his username, and Authenticating stores a verifier derived from his password. These endpoints call both, then start a session with Sessioning. An app copies this composition with [accounts](Accounts.md), and its frontend shows a password form.

The [register endpoint](reaction:Passwords.entering.Register) first calls `Authenticating._acceptable`. When the password is too short or too long, the request is refused with `INVALID_PASSWORD` before anyone is registered, because the engine doesn't undo `Registering.register` when a later action in the same request is refused. Otherwise the endpoint registers the username, sets the password for the new user, and starts a session. Because the endpoint always registers a new user, nobody can sign up with a password as Sam after he signed in with Commons: the request is refused by `Registering.register` with `USERNAME_TAKEN`. For any caller, a password outside those lengths is still refused by `Authenticating.set` with `INVALID_PASSWORD`, and a second password for the same user with `PASSWORD_SET`.

The [sign-in endpoint](reaction:Passwords.entering.SignIn) calls `Registering._byUsername` for the user, checks the password with `Authenticating.authenticate`, and starts a new session. A username nobody has is refused with `INVALID_CREDENTIALS`, the same refusal as a wrong password. Sam, who has no password, is refused the same way.

Each endpoint responds with the user, the session, and its expiry, and the HTTP server moves the session into a cookie that the page's scripts can't read, as `passwordsHttp` beside the endpoints declares.

```endpoints
Passwords.entering.Register at /auth/register
Passwords.entering.SignIn at /auth/login
```

If `Authenticating.set` or `Sessioning.start` fails after `Registering.register` has succeeded, for example because the database stops answering, the username stays registered with no password, and signing up again with it is refused with `USERNAME_TAKEN`. The engine doesn't undo the registration, and this composition offers no repair; the person picks another username. This is accepted, as in ConceptBox, because it needs a failure between two writes of one request.

**design/compositions/Saved.md**

# Saved things

A signed-in person keeps their own favorites, saved trips, preferences and trip journal. Every endpoint here starts with `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and acts on that person only: nobody can read or change another person's things, because no endpoint takes a person as an input.

The [my-things request](reaction:Saved.Mine.ShowMine) carries the session and answers with everything the person has kept: [their favorites](former:Saved.Mine.MyFavorites), each with the place's name, kind and floor from `Wayfinding._place`, newest first; [their saved trips](former:Saved.Mine.MyTrips), each with the names of its two places; [their preferences](former:Saved.Mine.MyPreferences); [their recent trips](former:Saved.Mine.MyHistory), newest first, with place names; and [their totals](former:Saved.Mine.MyTotals), the number of finished trips and the estimated metres. Because favorites, trips and journal entries are only ever kept for places on the map, and places are never removed, every one of them is listed.

```endpoints
Saved.Mine.ShowMine at /me
```

[Favoriting a place](reaction:Saved.Favorites.Favorite) carries the session and the place; a place `Wayfinding._place` does not know is refused with NO_SUCH_PLACE before anything is kept, and a place already favorited is refused with ALREADY_FAVORITE. [Unfavoriting](reaction:Saved.Favorites.Unfavorite) carries the same and refuses a place that is not a favorite with NOT_FAVORITE. Both answer with nothing.

```endpoints
Saved.Favorites.Favorite at /me/favorites/add
Saved.Favorites.Unfavorite at /me/favorites/remove
```

[Saving a trip](reaction:Saved.Trips.SaveTrip) carries the session, a name, the two places and the step-free flag, and answers with the trip; a source or destination `Wayfinding._place` does not know is refused with NO_SUCH_PLACE before anything is kept, a name the person already uses is refused with TRIP_NAME_TAKEN and an empty one with EMPTY_TRIP_NAME. [Removing a trip](reaction:Saved.Trips.RemoveTrip) carries the session and the trip and answers with nothing; a trip that is not the person's own is refused with NO_SUCH_TRIP, the same as one that does not exist, so nobody learns about another person's trips.

```endpoints
Saved.Trips.SaveTrip at /me/trips/save
Saved.Trips.RemoveTrip at /me/trips/remove
```

[Setting preferences](reaction:Saved.Preferences.SetPreferences) carries the session and both flags (step-free routes by default, use my location) and answers with nothing. The page applies them when it loads.

```endpoints
Saved.Preferences.SetPreferences at /me/preferences/set
```

When a person reaches the end of a route, the page [records the trip](reaction:Saved.Journal.FinishTrip) with the session, the two places and the distance in metres. The page works out the metres itself before sending them: it adds up the route's step distances and multiplies by 50, because an outdoor walk's distance is 1 plus its metres over 50, and treats indoor steps the same way, so the figure is an estimate and the page says so. The endpoint stores the metres as given. It answers with the entry; an unknown place is refused with NO_SUCH_PLACE and a negative distance with INVALID_DISTANCE. The page sends one finish per route; a repeated request, such as a retry, adds a second entry, which this beta accepts because the totals are estimates.

```endpoints
Saved.Journal.FinishTrip at /me/trips/finish
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
