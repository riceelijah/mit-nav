# Role and objective

Work unit `accounts`; role `critic`; phase `contracts`.

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

**.sync-engine/work/accounts/tasks/critic.md**

Review the accounts design against the brief: copied sign-in concepts and compositions (Accounts, Passwords, Commons), new concepts Favoriting, Planning, Journaling, Preferring, the Saved composition, and Campus changes (session-guarded flag/clear, reporter usernames). Focus on authorization (no endpoint may act on another person), refusals, and whether each new concept is a complete mechanism. Report Verdict with numbered findings.

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
- Execution mixed: designer and workers simulated by the coordinator; contract critic delegated to a fresh Claude Code agent.

## Done when

- `bun run check:design`, `bun run generate`, `bun run check` pass.
- `bun test` passes, including ConceptBox's concept tests for the copied concepts, tests for each new concept's principle and refusals, and HTTP tests: sign up, flag with session, reporter is the username, another user cannot remove someone else's trip, endpoints refuse without a session.
- In the local app: sign up with a password, flag and clear, favorite a place, save and reuse a trip, toggle step-free default, finish a trip and see totals.

## Open questions

None.

## Activity

- Work item started.

## Changed candidate contracts

**design/compositions/Accounts.md**

# Accounts

Every user is created by `Registering.register`, which stores the username other people type to find them. `Sessioning.use` returns a session's user on each request. Neither concept refers to the other. Each way of signing in is a composition of its own: it registers or looks up a user, then calls `Sessioning.start`. To reuse accounts, copy this composition with one or more ways of signing in, such as [passwords](Passwords.md) and [Commons](Commons.md); the frontend calls them through the session helpers in `web/app.ts`.

The [me endpoint](reaction:Accounts.identifying.Me) passes the session to `Sessioning.use`, which returns the user, then responds with the user's username from `Registering._username`. Every endpoint that requires a session starts the same way: `Sessioning.use` returns the session's user, or the request is refused with `NOT_SIGNED_IN`. Each endpoint reads the user from the session, never from the request's inputs. Each way of signing in responds with the user, and the page then calls the me endpoint for the username.

```endpoints
Accounts.identifying.Me at /auth/me
```

The [sign-out endpoint](reaction:Accounts.leaving.SignOut) ends the session with Sessioning, and the HTTP server clears the cookie. If the person is also signed in on another computer, they stay signed in there.

```endpoints
Accounts.leaving.SignOut at /auth/logout
```

**design/compositions/Campus.md**

# MIT campus navigation

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks. Inside the buildings whose room lists have been converted, each floor is a corridor, joined to the floors above and below by the building's stairs and elevators, with the classrooms, labs, offices and other rooms a visitor looks for opening off it. Buildings that touch are joined indoors on the floors they share. Simmons Hall keeps its detailed hand-made map and joins the campus through its main lobby entrance. The campus has thousands of places and connections, so the app never sends the whole map to the browser. A visitor finds a place by typing part of its name: the [place search](former:Campus.Browsing.PlaceSearch) answers at most 40 matching places that can be a start or a destination, with entrances first (every building and the Simmons lobby are entrances), and the [search request](reaction:Campus.Browsing.SearchPlaces) carries the typed text and answers with those places; when nothing matches the answer is an empty list, not a refusal. Anyone can also see the problems reported so far: the [problem list](former:Campus.Browsing.ProblemList) lists open reports, each with the reporter's username from `Registering._username`, the names of its connection's two places and its directions, and the [blocked list](former:Campus.Browsing.BlockedList) lists every blocked connection the same way, including any blocked without a report, so it can still be marked clear. The [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both lists. Generated place names begin with the building ("Building 32, floor 1", "32-123 Lecture Hall"), so typing a building or room number finds them.

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

The map itself is filled in by [adding places](reaction:Campus.Setup.AddPlace) and [connecting them](reaction:Campus.Setup.Connect). In this version these are run by a seed script, which loads the Simmons map and the campus map generated from MIT's room inventory and building footprints, rather than by visitors. Adding a place carries its name, kind, and floor and answers with the place, refusing a name already in use with DUPLICATE_PLACE; connecting carries both places and the connection's directions, step-free flag, closing hours, service, and distance and answers with the connection, refusing an unknown place with NO_SUCH_PLACE. Because this version has no accounts, these endpoints are open to anyone who calls them; restricting them belongs with sign-in.

```endpoints
Campus.Setup.AddPlace at /map/add-place
Campus.Setup.Connect at /map/connect
```

**design/compositions/Commons.md**

# Signing in with Commons

Sam clicks "Sign in with Commons". On Commons, he allows the app once, and his browser comes back with a one-time code. The app's server trades the code with Commons for his Commons user and username, and he is signed in. His Commons password never reaches the app. CommonsFederating is Federating with a `CommonsProvider`, which builds the address of Commons' sign-in page and redeems each code. An app copies this composition with [accounts](Accounts.md), and its frontend shows a Commons button and a callback page.

## Starting

The [start endpoint](reaction:Commons.starting.StartCommons) calls `CommonsFederating.start`, which returns a new attempt and the address of Commons' sign-in page. The HTTP server moves the attempt into a second cookie, the sign-in cookie, which expires with the attempt ten minutes later, and the page sends the browser to the address. The finish and choose endpoints read the attempt from that cookie, so only the browser that started a sign-in can finish it. The address carries the attempt's nonce, which Commons sends back as `state`, and a hash of the attempt's verifier, which Commons keeps with the code it issues.

```endpoints
Commons.starting.StartCommons at /auth/commons/start
```

## Finishing

Commons sends the browser to `/auth/commons/callback` with `code` and `state`. The callback page replaces that address with `/`, so reloading the page or going back doesn't post the code again, and posts both to the [finish endpoint](reaction:Commons.finishing.FinishCommons). `CommonsFederating.finish` checks the attempt from the cookie and the nonce before it sends anything to Commons, then redeems the code with the attempt's verifier and returns the username Commons reported. Then one of two branches runs:

- `returning`: `CommonsFederating._user` returns the user linked to Sam's Commons user, whatever his email or username has become, and the endpoint starts a session for that user.
- `new`: nobody is linked yet. The endpoint registers Sam's Commons username with Registering, links his Commons user to the new user, and starts a session.

When Leo sends Sam a link that finishes a sign-in Leo started, Sam's browser doesn't hold Leo's attempt, so the request is refused by `CommonsFederating.finish` with `SIGN_IN_EXPIRED` before any request goes to Commons. A code Commons won't redeem, or a Commons that doesn't answer within ten seconds, is refused with `SIGN_IN_REFUSED`. A successful finish clears the sign-in cookie and sets the session cookie.

When someone already registered `sam` with a password, the `new` branch is refused by `Registering.register` with `USERNAME_TAKEN`, or with `INVALID_USERNAME` when the Commons username doesn't follow Registering's rule. The sign-in cookie stays, the page shows a username form, and Sam's choice is posted to the [choose endpoint](reaction:Commons.finishing.ChooseUsername). When `CommonsFederating._linkable` returns true, that endpoint registers the chosen username, links it, and starts a session. When it returns false, because the attempt expired or Sam's Commons user was linked in another tab meanwhile, the request is refused with `SIGN_IN_EXPIRED`. `CommonsFederating.link` accepts any user, so a Commons account is linked to whichever user these two endpoints pass to it, and link doesn't check expiry, so it succeeds for an attempt that expires between `_linkable` and `link`.

```endpoints
Commons.finishing.FinishCommons at /auth/commons/finish
Commons.finishing.ChooseUsername at /auth/commons/choose
```

## Refusals and the two cookies

The HTTP server clears a cookie only when its endpoint succeeds, or when the answer is `UNAUTHORIZED`. Every refusal from CommonsFederating maps to `FORBIDDEN` instead, as `commonsHttp` beside the endpoints declares with the sign-in cookie, so a stale tab or Leo's link leaves Sam's sign-in cookie in place, and the page shows the username form only for `CONFLICT` and `INVALID_REQUEST`.

The server sends `Referrer-Policy: no-referrer` with every page, so the callback address never leaves in a `Referer` header. The browser's history still lists the callback address, with its code. Commons issued that code for the hash of the verifier in Sam's attempt, which never leaves the server except to redeem it, so anyone who reads the code is refused with `SIGN_IN_REFUSED`. This is PKCE, from OAuth.

Signing in with Commons starts a session in the app, and withdrawing the app on Commons later doesn't end it. Two browsers choosing usernames for the same Commons account at the same moment can leave the second username registered and unlinked, because the engine doesn't undo `Registering.register` when `link` is refused. It takes two submissions within milliseconds of each other.

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

**design/compositions/Saved.md**

# Saved things

A signed-in person keeps their own favorites, saved trips, preferences and trip journal. Every endpoint here starts with `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and acts on that person only: nobody can read or change another person's things, because no endpoint takes a person as an input.

The [my-things request](reaction:Saved.Mine.ShowMine) carries the session and answers with everything the person has kept: [their favorites](former:Saved.Mine.MyFavorites), each with the place's name, kind and floor from `Wayfinding._place`, newest first; [their saved trips](former:Saved.Mine.MyTrips), each with the names of its two places; [their preferences](former:Saved.Mine.MyPreferences); [their recent trips](former:Saved.Mine.MyHistory), newest first, with place names; and [their totals](former:Saved.Mine.MyTotals), the number of finished trips and the estimated metres. A favorite or trip whose place is no longer on the map is left out.

```endpoints
Saved.Mine.ShowMine at /me
```

[Favoriting a place](reaction:Saved.Favorites.Favorite) carries the session and the place; a place already favorited is refused with ALREADY_FAVORITE. [Unfavoriting](reaction:Saved.Favorites.Unfavorite) carries the same and refuses a place that is not a favorite with NOT_FAVORITE. Both answer with nothing.

```endpoints
Saved.Favorites.Favorite at /me/favorites/add
Saved.Favorites.Unfavorite at /me/favorites/remove
```

[Saving a trip](reaction:Saved.Trips.SaveTrip) carries the session, a name, the two places and the step-free flag, and answers with the trip; a name the person already uses is refused with TRIP_NAME_TAKEN and an empty one with EMPTY_TRIP_NAME. [Removing a trip](reaction:Saved.Trips.RemoveTrip) carries the session and the trip and answers with nothing; a trip that is not the person's own is refused with NO_SUCH_TRIP, the same as one that does not exist, so nobody learns about another person's trips.

```endpoints
Saved.Trips.SaveTrip at /me/trips/save
Saved.Trips.RemoveTrip at /me/trips/remove
```

[Setting preferences](reaction:Saved.Preferences.SetPreferences) carries the session and both flags (step-free routes by default, use my location) and answers with nothing. The page applies them when it loads.

```endpoints
Saved.Preferences.SetPreferences at /me/preferences/set
```

When a person reaches the end of a route, the page [records the trip](reaction:Saved.Journal.FinishTrip) with the session, the two places and the estimated metres, which the page adds up from the route's step distances (an outdoor walk's distance is 1 plus its metres over 50, so each unit is about 50 metres). It answers with the entry; a negative distance is refused with INVALID_DISTANCE. The figure is an estimate and the page says so.

```endpoints
Saved.Journal.FinishTrip at /me/trips/finish
```

**design/concepts/Authenticating.md**

# Authenticating

## Purpose

Let people come back to their account by proving who they are with a password.

*Prevents:* someone signs in with a password other than the one set for that user; someone replaces the password of an account that already has one; someone who reads the stored data learns a person's password.

## Principle

Ben sets a password when he signs up, and the next day he authenticates with it. Leo guesses at Ben's password and is refused with "The username or password is incorrect." Leo then tries to set a new password for Ben, and is refused with "This account already has a password."

## Types

```types
external User
  The person a password belongs to.

opaque Secret
  A password verifier derived with a random salt; the implementer chooses how to represent it.
```

## State

```state
a set of Users with
  a verifier Secret

Rule: Authenticating stores only a verifier derived from the password, never the password itself.
```

## Actions

```actions
set(user: User, password: String) : returns (user: User)
  where password is shorter than 8 or longer than 128 characters
  then
    refuses INVALID_PASSWORD "A password must have 8 to 128 characters."
  where user already has a verifier
  then
    refuses PASSWORD_SET "This account already has a password."
  where password is accepted and user has no verifier
  then
    add user with a verifier derived from password
    returns user

authenticate(user: User, password: String) : returns (user: User)
  where user has no verifier, or password does not match it
  then
    refuses INVALID_CREDENTIALS "The username or password is incorrect."
  where password matches the user's verifier
  then
    returns user
```

## Queries

```queries
_acceptable(password: String) : one (acceptable: Flag)
  Returns true when the password has 8 to 128 characters, and false otherwise.
```

**design/concepts/Favoriting.md**

# Favoriting

## Purpose

Let each person keep a short list of the items they come back to, so they can pick one again without searching for it.

## Principle

Ana favorites the Stata Center and her lab, 32-G904. Both appear in her favorites, newest first, and in nobody else's. Favoriting the lab again is refused because it is already there. When she unfavorites the Stata Center, only the lab is left; unfavoriting it a second time is refused because it is no longer there.

## Types

```types
external User
  The person whose favorites these are.

external Item
  The thing a person favorites.
```

## State

```state
a set of Favorites with
  a user User
  an item Item
  an order Number

  Rule: a person favorites an item at most once
```

## Actions

```actions
favorite(user: User, item: Item) : returns ()
  where user has item among their favorites
  then
    refuses ALREADY_FAVORITE "That is already a favorite."
  where user does not have item among their favorites
  then
    add a new favorite with user and item, after every earlier favorite
    returns

unfavorite(user: User, item: Item) : returns ()
  where user does not have item among their favorites
  then
    refuses NOT_FAVORITE "That is not a favorite."
  where user has item among their favorites
  then
    delete the favorite of user for item
    returns
```

## Queries

```queries
_favorites(user: User) : many (item: Item)
  Answers the user's favorite items, newest first, and no rows when they have none.
```

**design/concepts/Federating.md**

# Federating

## Purpose

Let people sign in with an account they already have on another site, and come back to the same account each time.

*Prevents:* someone opens a link that finishes a sign-in another person started, and ends up in that person's account; someone reads a code meant for another person, such as from their browser's history, and signs in as them; a person's details change on the other site, and they get a second account; someone links another person's account on the other site to an account they control.

## Principle

Sam starts a sign-in, approves the app on the other site, and his browser finishes the attempt it started. The other site confirms that the code belongs to its user `u7f3`, whose username is `sam`. The app registers `sam`, and his account `u7f3` is linked to that user. After he changes his username on the other site, Sam signs in again, and Federating returns the same user. Leo sends Sam a link that finishes a sign-in Leo started; Sam's browser never started that attempt, so finishing it is refused with "This sign-in has expired. Start again." Leo reads a code from Sam's browser history and finishes a sign-in of his own with it. The code was issued for the verifier of Sam's attempt, so the other site doesn't confirm it for Leo's, and finishing is refused with "The other site didn't confirm this sign-in. Start again."

## Types

```types
external User
  The account in the app that a sign-in on the other site reaches.
```

## State

```state
a set of Attempts with
  a nonce String
  a verifier String
  an expiresAt DateTime

a set of Confirmed Attempts with
  a subject String

a set of Links with
  a unique subject String
  a User

Rule: an attempt, its nonce, and its verifier are unguessable. start returns the attempt and its nonce only to its caller, and finish refuses an attempt without its nonce. The verifier is sent only to the other site, with the code.
Rule: Federating may delete an attempt once it has expired.
```

## Actions

```actions
start() : returns (attempt: Attempt, expiresAt: DateTime, address: String)
  where true
  then
    add a new attempt with a fresh nonce and a fresh verifier that expires 10 minutes from now
    set address to the other site's sign-in address, carrying the nonce and a hash of the verifier
    returns attempt, expiresAt, address

finish(attempt: Attempt, nonce: String, code: String) : returns (username: String)
  where attempt is unknown, expired, or in Confirmed Attempts, or nonce is not the attempt's nonce
  then
    refuses SIGN_IN_EXPIRED "This sign-in has expired. Start again."
  where the other site refuses the code with the attempt's verifier, or doesn't answer
  then
    refuses SIGN_IN_REFUSED "The other site didn't confirm this sign-in. Start again."
  where the other site confirms the code for its user subject, whose username is username
  then
    add attempt to Confirmed Attempts with subject
    returns username

link(attempt: Attempt, user: User) : returns (user: User)
  where attempt is not in Confirmed Attempts
  then
    refuses NOT_CONFIRMED "This sign-in hasn't been confirmed."
  where a link has the attempt's subject
  then
    refuses ALREADY_LINKED "This account on the other site is already linked."
  where attempt is in Confirmed Attempts and no link has its subject
  then
    add a new link with the attempt's subject and user
    returns user
```

## Queries

```queries
_user(attempt: Attempt) : optional (user: User)
  Returns the user linked to a confirmed attempt's subject, or no row when the attempt is unconfirmed or its subject is unlinked.

_linkable(attempt: Attempt) : one (linkable: Flag)
  Returns true when the attempt is confirmed, unexpired, and its subject unlinked, and false otherwise.
```

**design/concepts/Journaling.md**

# Journaling

## Purpose

Keep a record of the trips each person finishes, so they can look back at where they have been and see how far they have gone in total.

## Principle

Ana finishes a trip from Simmons Hall to 32-G904 of about 900 metres, then one back of about 900 metres. Her history lists the trip back first, and her totals are 2 trips and 1800 metres. Ben, who has finished nothing, sees an empty history and totals of 0 trips and 0 metres. A finished trip with a negative distance is refused and leaves her totals as they were.

## Types

```types
external User
  The person who made the trip.

external Place
  Where a trip started or ended.
```

## State

```state
a seq of Entries with
  a traveller User
  a source Place
  a destination Place
  a meters Number
```

## Actions

```actions
finish(traveller: User, source: Place, destination: Place, meters: Number) : returns (entry: Entry)
  where meters is less than 0
  then
    refuses INVALID_DISTANCE "A trip cannot be shorter than nothing."
  where meters is at least 0
  then
    append a new entry with traveller and source and destination and meters
    returns entry
```

## Queries

```queries
_history(traveller: User) : many (entry: Entry, source: Place, destination: Place, meters: Number)
  Answers the traveller's 20 most recent entries, newest first, and no rows when they have none.
_totals(traveller: User) : one (trips: Number, meters: Number)
  Answers how many entries the traveller has and the sum of their metres, both 0 when they have none.
```

**design/concepts/Planning.md**

# Planning

## Purpose

Let each person save the trips they make often under names of their own, so a regular trip can be started again in one step.

## Principle

Ana saves "To lab" from Simmons Hall to 32-G904, step-free. It appears in her trips and in nobody else's. Saving another trip called "To lab" is refused because the name is taken, while Ben can save a trip with that name for himself. Ben cannot remove Ana's trip. When Ana removes "To lab", her list is empty again.

## Types

```types
external User
  The person who saved the trip.

external Place
  Where a trip starts or ends.
```

## State

```state
a set of Trips with
  an owner User
  a name String
  a source Place
  a destination Place
  an accessibleOnly Flag
  an order Number

  Rule: a person's trips have different names
```

## Actions

```actions
save(owner: User, name: String, source: Place, destination: Place, accessibleOnly: Flag) : returns (trip: Trip)
  where owner has a trip called name
  then
    refuses TRIP_NAME_TAKEN "You already have a trip with that name."
  where name is empty
  then
    refuses EMPTY_TRIP_NAME "A trip needs a name."
  where name is not empty and owner has no trip called name
  then
    add a new trip with owner and name and source and destination and accessibleOnly, after every earlier trip
    returns trip

remove(owner: User, trip: Trip) : returns ()
  where trip not in trips or trip's owner is not owner
  then
    refuses NO_SUCH_TRIP "You have no such trip."
  where trip in trips and trip's owner is owner
  then
    delete trip
    returns
```

## Queries

```queries
_trips(owner: User) : many (trip: Trip, name: String, source: Place, destination: Place, accessibleOnly: Flag)
  Answers the owner's trips in the order they were saved, and no rows when they have none.
```

**design/concepts/Preferring.md**

# Preferring

## Purpose

Remember how each person likes the app to behave, so they do not have to set it up again on every visit or device.

## Principle

Ana has never set anything, so she gets the defaults: routes are not restricted to step-free, and the app does not use her location. She turns on step-free routes and location; the next time she reads her preferences, both are on. Ben's preferences are still the defaults.

## Types

```types
external User
  The person whose preferences these are.
```

## State

```state
a set of Preferences with
  a unique user User
  a stepFree Flag
  a useLocation Flag
```

## Actions

```actions
set(user: User, stepFree: Flag, useLocation: Flag) : returns ()
  where true
  then
    set the user's preferences to stepFree and useLocation, adding them if the user has none
    returns
```

## Queries

```queries
_preferences(user: User) : one (stepFree: Flag, useLocation: Flag)
  Answers the user's preferences, or false for both when the user has never set them.
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
_place(place: Place) : optional (name: String, kind: Kind, floor: Number)
  Answers the place's name, kind and floor when the place is known, and nothing otherwise.
_search(text: String) : many (place: Place, name: String, kind: Kind, floor: Number)
  Answers at most 40 places that are not TRANSIT whose name contains the text, ignoring case, with entrances first and then by name in natural number order (so 2 comes before 10); an empty text answers the first 40 places in that order, and no rows when nothing matches.
_link(link: Link) : optional (sourceName: String, destinationName: String, forward: String, service: String)
  Answers the names of the connection's two places, its forward directions, and its service when the link is known, and nothing otherwise.
_blocked() : many (link: Link, sourceName: String, destinationName: String, forward: String, service: String)
  Answers every blocked connection with the names of its two places, its forward directions, and its service, in the order the connections were made, and no rows when nothing is blocked.
_sameService(link: Link) : many (other: Link)
  Answers every other connection that shares the link's service, in the order the connections were made, and no rows when the link is unknown or its service is empty.
_route(source: Place, destination: Place, accessibleOnly: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, floor: Number, distance: Number)
  Answers the shortest route from source to destination, where each connection costs the distance it was given when it was made (so a builder can make a short flight of stairs cheaper than waiting for an elevator), as numbered steps starting at 1, each with the distance its connection was given, never using a blocked connection or one that is closed at the given hour of the day (0 up to 24, so 6.5 is half past six in the morning), and when accessibleOnly is true never using a connection that is not accessible. Answers no rows when either place is unknown or no route exists, and one row per step in order otherwise. Ties are broken in favor of connections made earlier.
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
