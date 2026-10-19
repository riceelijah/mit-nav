# Role and objective

Work unit `frontend-redesign`; role `application-worker`; phase `implementation`.

# Application worker

Implement and test the assigned registration, composition, assembly, configuration, boundary, host, and integration work from approved design and concept surfaces. Keep concept implementations, frontend behavior, and authored design read-only unless the task explicitly expands ownership.

Before editing, inventory every selected endpoint, internal reaction, view, former, computation, module/group placement, and endpoint path against the supplied design. Register raw concept classes, refusals, computations, and static instances exactly once. Implement each approved obligation, acknowledgement order, and recovery path through documented composition declarations.

Use the selected transport end to end. Do not invent missing declarations, duplicate owner invariants or effects, bypass the boundary, call concepts directly from a host, or create a parallel product router. Generate artifacts only through project commands.

Repair in-scope wiring and test diagnostics. Do not edit authored design, concept implementation, audit records, or tests outside the write grant, and do not replace required scenarios with skipped or TODO tests. Report a design blocker when every documented realization changes approved behavior, a context blocker when one documented repair leaves the API undetermined, or an environment blocker when checks cannot run.

# Access

Root: "/Users/riceelijah/dev/classes/6104/simmons-nav". The short native message explicitly authorizes reading this prompt file; all assignment context is inline below. This is already a compiled role assignment: do not load a skill, workflow, harness guide, or another instruction file.

- Read: `application:.` ("/Users/riceelijah/dev/classes/6104/simmons-nav").
- Write: `owned-concept:src/concepts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/concepts"), `owned-integration:data` ("/Users/riceelijah/dev/classes/6104/simmons-nav/data"), `owned-integration:generated` ("/Users/riceelijah/dev/classes/6104/simmons-nav/generated"), `owned-integration:scripts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/scripts"), `owned-integration:src/compositions` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/compositions"), `owned-configuration:README.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/README.md"), `owned-frontend:web` ("/Users/riceelijah/dev/classes/6104/simmons-nav/web"), `owned-test:tests` ("/Users/riceelijah/dev/classes/6104/simmons-nav/tests").
- Tools: `repository-read`, `repository-write`.
- Shell: `project-local`; network: no; generated output: no; long-running processes: no.

Inspect only listed files or directories. In coordinator simulation, this grant binds the coordinator itself; broader coordinator access and prior discovery are unavailable to the assignment. Project checks may transitively read other project files, but do not inspect them yourself. Use supplied or task-named package-owned public documentation; do not browse package trees. Never inspect package `dist`, framework internals, caches, sibling applications, or undeclared declarations. Exclude `.git`, `.sync-engine` except this prompt, harness/skill configuration, agent traces, parent directories, and unrelated generated output. Ask for context instead of searching outside the grant. Generated files come only from granted commands. Never grantable: `git-mutation`, `dependency-installation`, `framework-internals`, `workflow-management`, `skill-cli-invocation`, `delegation-or-handoff`.

# Guidance

# Framework use

Implement from supplied public references, named package-owned public documentation or examples, generated caller contracts, and ordinary project diagnostics. Do not browse package trees for alternatives.

Never inspect package `dist`, framework internals, runtime exports, caches, sibling applications, or declarations not explicitly supplied as public context. Never import from `node_modules/` or `dist/` paths. A diagnostic may name an internal file; use the diagnostic without opening it.

Repair ordinary diagnostics through the project checks. When supplied material does not determine the next API shape, try at most one directly supported repair, then report a context or design blocker instead of trying speculative variants.

---

# Application integration

Own assigned concept registration, instance construction, composition, assembly, configuration, boundary projection, hosting, generated-artifact commands, and integration tests. Use public package subpaths and the supplied declarations.

## Register concepts and instances

Import each approved Markdown specification as text. Register the raw implementation class and map every declared refusal code to its stable error class:

```ts
import { conceptSet, registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Posting.md" with { type: "text" };
import { InvalidContent, PostingConcept } from "./concepts/Posting.ts";

const posting = registerConcept({
  class: PostingConcept,
  spec,
  refusals: { INVALID_CONTENT: InvalidContent },
});

export const applicationConceptSet = conceptSet({ Posting: posting });
```

Do not wrap, adapt, or subclass a concept merely for registration. When specializing a generic class, preserve the application-specific class name and authored external-type binding. Register each selected static instance once under its authored identity; do not reuse one raw instance under two identities or invent an undeclared instance. Register computations as pure functions of their input record; a computation that would need concept state is a design blocker.

For default-constructible concepts, assemble with fresh registered implementations:

```ts
import { assemble } from "@mit-sdg/sync-engine/assembly";
import { applicationConceptSet } from "./concepts.ts";
import { composition } from "./composition.ts";

assemble({
  conceptSet: applicationConceptSet,
  instances: applicationConceptSet.implementations(),
  composition,
});
```

## Realize selected declarations

Implement only declarations selected by exact authored links. An endpoint is the reaction named by its `reaction:` link and uses the pathname from its matching endpoint entry. A separate internal reaction requires its own link. Keep module, group, declaration, computation, and path identities aligned.

Composition coordinates owners but does not absorb their invariants or make them atomic. Implement required effects before acknowledgement unless approved failure semantics say otherwise. Give retries a stable identity accepted by the effect owner and implement the designed recovery action.

Hosts project the boundary and contain no product policy. Never build a request router outside the `@mit-sdg/sync-engine-http` handler and policy. A host may wrap the handler in `Bun.serve` but must not match paths itself. A supplied transport owns its routing, wire, and error policy; do not duplicate it with a hand-written router or direct concept calls.

Treat source-agreement diagnostics as contract mismatches rather than hiding them with alternate wiring. Run generation through the project command and never edit generated files. Use the generated core wire for gateways; transport projections are caller contracts, not assembly input.

---

# Composition declarations

`@mit-sdg/sync-engine/language` declares reactions, views, formers and computations;
`@mit-sdg/sync-engine/boundary` declares endpoints. Declaration does not execute:
`assemble` from `@mit-sdg/sync-engine/assembly` registers what these produce.

Import an approved specification through the `@design` alias, which the installed
`tsconfig.json` maps to the design root: `import spec from "@design/concepts/Name.md" with
{ type: "text" }`. `generated.config.ts` lists only the application documents,
`design/types.md` and `design/compositions/*.md`, as URLs written
`new URL("./design/types.md", import.meta.url)`. Concept specifications enter through
`registerConcept({ spec })` and are never listed there; the application-design loader
rejects a concept file with "types fence accepts only `concrete Name` declarations".

## Reactions

`reaction`, `when`, `where`, `returned`, `refused`, `no`, `whether`, `earlier`, `now` and
`is` come from `@mit-sdg/sync-engine/language`.

```ts
reaction(({ author, post }) =>
  when(Posting.publish({ author }).responds({ post })).then(Indexing.add({ item: post })),
);
```

- A trigger is one callable action line or one outcome channel, followed by optional
  `.where(...)` conditions and `.then(...)` consequences. `action(input)` alone matches the
  request; `.responds(output?)` and `.refuses(output?)` match the outcome.
- `returned(pattern?, { by?, except?, exceptBy? }?)` and `refused(...)` match an action's
  outcome and may be the trigger themselves, as in
  `when(returned({ post }, { by: "Posting.publish" }))`. `where(...)` takes conditions;
  `no(readLine)` and `whether(readLine)` test one.
- `earlier(action, input, output?)` refers to a prior occurrence.
- `now(variable)` binds the instant stamped on this flow's outermost occurrence, so every
  reaction in one flow reads one time and a caller can author none. Pass that variable to
  each action needing the instant; never model a clock as a concept.
- `is.lt`, `is.le`, `is.gt`, `is.ge`, `is.among` compare.
- `.afterFlowSettles()` may follow `when(trigger)` or a completed stage, then `.then(step)`
  or `.where(...).then(step)`. A chained deferred stage accepts condition lines only.

Each composition module exports one `composition` record of named groups, and `assemble`
receives those records keyed by module:

```ts
export const composition = { Publishing: { PublishPost, IndexOnPublish } };
```

An authored link names the same three parts: `reaction:Board.Publishing.IndexOnPublish`
requires module `Board`, group `Publishing` and declaration `IndexOnPublish`. Read the
approved design's links and use those exact names; `MISSING_COVERAGE` reports a selected
declaration no link names.

## Views, formers and computations

`view`, `former`, `form`, `each`, `count` and `compute` come from the same subpath.

```ts
view(name, (input, output, free) => where(...)).holds();
view(name, (input, output, free) => where(...)).one();
former(name, (input, free) => form({ ...shape }));
former(name, (input, free) => where(...).form({ ...shape }));
```

- A view's `.holds()`, `.one()`, `.optional()`, or `.many()` follows the closing
  `view(...)`; it is never called on `where(...)`.
- Builders receive binding bags. Reading a property, including by destructuring, declares a
  stable logic variable in that partition. Bind query outputs with `.is({ ... })`; do not
  destructure the query call itself:

  ```ts
  const targetFor = view("target for (code)", ({ code }, { target }, _free) =>
    where(Shortening._resolve({ code }).is({ target })),
  ).one();
  ```

  Completed views and formers take one object-shaped input mapping.

- A view with no output binding is a predicate and ends in `.holds()`. A view that binds
  output rows returns `.many()` by default and may state `.one()` or `.optional()` instead.
  Stacked `where` blocks are alternatives, and local bindings do not escape the view.
- `each(readLine).where(...).arranged(...)` then a consumer:

| Consumer           | Result                                     | Empty selection |
| ------------------ | ------------------------------------------ | --------------- |
| `.form({ ... })`   | one record per row                         | `[]`            |
| `.count()`         | number of rows                             | `0`             |
| `.first(value)`    | value from the first row after arrangement | `null`          |
| `.distinct(value)` | first-seen distinct values                 | `[]`            |

- A `form({ ...shape })` entry may be a bound variable, another formed node, or portable
  JSON literal data. Use literals directly for constant fields and structures; do not add a
  computation solely to produce a constant. Functions, symbols, `undefined`, non-finite
  numbers, class instances, and cyclic values are not portable literals.
- `form({ ...shape }).splicing(...formerUses)` merges record-rooted fragments into a host
  record. Every variable a fragment input references must already be bound, and fragment
  keys must not collide with host or earlier-fragment keys. A plain optional fragment drops
  the host row when absent; `whether(...)` keeps it and fills its leaves with `null`.
- `count(query, input, outputVariable)` requires one non-union query reference and its
  complete input mapping; undeclared fields are rejected recursively.
- `compute(named, input, output)` is a condition line inside `where(...)`. It runs a pure
  function supplied as `conceptSet`'s optional second argument and exposed as
  `set.computations`; it never takes a bare function. The function receives only its input
  record and must not read concept instances, `implementations()` results, or module-level
  mutable state. A computation that needs state is a design error to block on. A variable
  output binds the complete result. For a record-shaped, non-array result, an object output pattern binds or tests
  several fields, including nested fields, and each variable remains wire-traceable through
  its return-type path. Write
  `conceptSet({ ... }, { describe: ({ value }) => ({ label: String(value), rank: 1 }) })`,
  then `compute(set.computations.describe, { value }, { label, rank })`. A no-input
  computation uses `{}`. `is` exposes `.lt`, `.le`, `.gt`, `.ge`, and `.among`; test a
  computed boolean with `is.among(live, [true])` or `is.among(live, [false])`. Build the
  computation record before the set; references from separate sets do not mix.
- A query's `"one" | "optional" | "many"` promise links to a record return for `"one"` and
  an array of records otherwise, at type level and at runtime.

## Endpoints

`endpoint`, `receive` and `respond` come from `@mit-sdg/sync-engine/boundary`.

An endpoint is itself a selected reaction. Its design carries both a `reaction:` link and
an `endpoints` entry with the same module, group, and declaration name:

```text
Publishing a post [enters the application](reaction:Board.Publishing.PublishPost).
```

```endpoints
Board.Publishing.PublishPost at /board/post
```

Use that exact identity and path in the declaration and placement:

```ts
const PublishPost = endpoint(
  "/board/post",
  ({ author, content, post }) =>
    receive({ author, content })
      .then(Posting.publish({ author, content }).responds({ post }))
      .then(respond({ post })),
  { input: { required: ["author", "content"] } },
);

export const composition = { Publishing: { PublishPost } };
```

and register that composition under its linked module:

```ts
assemble({
  conceptSet: applicationConceptSet,
  instances: applicationConceptSet.implementations(),
  composition: { Board: composition },
});
```

Do not wrap the endpoint in another reaction. Do not declare an endpoint unless its exact
reaction link and endpoint entry exist in approved design. Conversely, every selected
public endpoint must have both before implementation begins.

- Paths must be canonical absolute URL pathnames that survive WHATWG pathname handling
  unchanged. Queries, fragments, scheme-relative paths, dot segments, malformed percent
  escapes, literal spaces and literal Unicode are rejected.
- `receive(...)` cannot author `path` or `requestId`; `respond(...)` cannot author
  `requestId` or `errorKind`.
- A stage may state `.afterFlowSettles()` to form its response at a settlement frontier; add
  conditions identifying the terminal state the endpoint requires.
- Sibling answers are alternatives, not ordered fall-through: an unconditional sibling
  overlaps every conditional one, and an endpoint records at most one answer. Give each
  branch a condition that excludes the others. Branching on whether an optional input was
  supplied needs a declared computation; if the design declares none, block rather than
  invent one.
- A binding produced by a state read belongs to the stage that consumes it. It does not
  safely cross an intervening action. Consume it before the action, return it from an
  owning action, or read it again in the later stage.
- Validators are explicit: `input`, `output` and `domainError`, each returning
  `{ ok: true } | { ok: false; detail?: string }` synchronously, at most once per path. The
  domain-error validator receives the response's top-level `error`. Generated types carry no
  runtime schema semantics.
- `InputContractDecl` takes `required` (a missing listed key returns `INVALID_INPUT`) and
  `defaults` (filled only when a key is absent). Without one, assembly intersects the keys
  every exported `receive(...)` for that path mentions. An explicit contract replaces that
  rather than merging, and only one may declare it per path. It must leave one `receive`
  alternative reachable: every key that alternative mentions is `required` or carries a
  matching default, or assembly refuses the path. A second alternative differing only by
  an omitted key is the invention the sibling rule forbids.

# Context

## Task

**.sync-engine/work/frontend-redesign/tasks/app.md**

Implement: path segment cost m/50; Wayfinding _closest with shared cheapest(); Preferring units; Saved units + validator; Campus FindClosest; frontend redesign, nearest buttons with real route metres, units everywhere, honest distance sum, auto-scroll after Done, progress on the map; tests.

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
- User also asked: auto-scroll to the next step after Done; show progress on the map (done grey, current highlighted, rest red). Page-only, within the approved prose.

## Authored types

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

## Compositions

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

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks along OpenStreetMap's footpaths, sidewalks and crossings; a walk that uses steps, or a path marked as not for wheelchairs, is not step-free. Each building joins the paths at each of its mapped entrances, or at the path point nearest it when it has none; a building with no path within 80 metres is joined by straight walks to its nearest buildings instead, so it stays reachable. Path points are only passed through and are never named in directions; the page shows consecutive outdoor walks as one step that adds up their metres and names the streets they follow. Inside the buildings whose room lists have been converted, each floor is a network of its corridors, lobbies and bridges, placed where MIT's floor plans put them and joined to one another by walking distance. Each corridor is a place that is only passed through, named by its room number and use ("32-100LA Lobby"); room numbers are unique and corridors are never also listed as rooms, so these names never collide with a room's. Every room, elevator stop and stairway with a known position attaches to the corridor nearest it; one without a position attaches to the corridor nearest the middle of that floor's corridors and takes that corridor's position. A floor whose corridors have no known positions is a single corridor instead, with its rooms opening off it.

A connection's distance is a cost, not a length: walking inside costs 0.2 plus the metres walked over 50, walking outside along a path the metres over 50, and the walk between a building's door and the paths, or a straight walk between two buildings far from any path, 1 plus the metres over 50, so a path is not penalised for its bends, and an elevator ride 3.5 plus half a unit per floor plus the walks to and from it. The route is the cheapest trip under those costs, so it takes the elevator that makes the whole trip shortest, counting the walk to each elevator, rather than simply the one nearest the destination. Each connection's directions carry the metres themselves ("Walk about 30 m to elevator E3 and take it up to floor 4"), and when the page shows several corridor walks in a row as one step, it adds up the metres written in them.

The ground floor is floor 1, or the lowest floor above it when there is no floor 1, or the lowest floor. A building is entered from the corridor nearest each of its OpenStreetMap entrances within 15 metres of its outline; with no such entrance, or when the ground floor is a single corridor, it is entered at the corridor nearest the building's centre, or at that single corridor. Two buildings whose outlines touch are joined indoors on a floor when each has a corridor on that floor within 35 metres of the other's outline, joining each building's corridor nearest the other building's outline; the floor plans mark a corridor at its middle, so corridors that meet at a shared wall are usually 20 to 50 metres apart as marked. Corridors of any two buildings within 15 metres of each other on a floor, such as the two ends of a bridge, are joined as well. When either building's floor has no positions, they are joined on that floor if their outlines touch, from each building's corridor nearest the other's centre (or its single corridor).

Simmons Hall is generated from its room list like every other building. The campus has thousands of places and connections, so the app never sends the whole map to the browser. A visitor finds a place by typing part of its name: the [place search](former:Campus.Browsing.PlaceSearch) answers at most 40 matching places that can be a start or a destination, with entrances first (every building is an entrance), and the [search request](reaction:Campus.Browsing.SearchPlaces) carries the typed text and answers with those places; when nothing matches the answer is an empty list, not a refusal. Anyone can also see the problems reported so far: the [problem list](former:Campus.Browsing.ProblemList) lists open reports, each with the reporter's username from `Registering._username` (a report whose reporter has no username, such as one made before accounts existed, is still listed, with no name, so an open problem is never hidden), the names of its connection's two places and its directions, and the [blocked list](former:Campus.Browsing.BlockedList) lists every blocked connection the same way, including any blocked without a report, so it can still be marked clear. The [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both lists. Generated place names begin with the building ("Building 32, floor 1", "32-123 Lecture Hall"), so typing a building or room number finds them.

The page can also show a floor plan of any floor a route passes through. The [floor request](reaction:Campus.Browsing.ShowFloor) carries a building number and a floor and answers, from the [floor former](former:Campus.Browsing.FloorPlan), the rooms, corridors and other places on that floor that have a position, with their kind. A room without a position of its own has borrowed its corridor's (or, on a single-corridor floor, its building's), so several places share that exact position; the page draws one cell per position, for the corridor when one of the places sharing it is a corridor and for none otherwise, so a borrowed position is never drawn as a room. The page draws each cell as the area nearer to its position than to any other, inside the building's outline, labels it with its room number, tints corridors, highlights the destination, and draws the route over it. It is a schematic redrawn from room positions, not MIT's drawing, and the page says so. The building is text and the floor a number; a request missing either, or with a floor that is not a number, is refused as an invalid request. A building or floor with no such places answers an empty list.

```endpoints
Campus.Browsing.ShowOverview at /map/overview
Campus.Browsing.SearchPlaces at /map/search
Campus.Browsing.ShowFloor at /map/floor
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because a passage can be closed at some hours of the day; the generated campus map has no closing hours yet, so today every hour gives the same route. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps, each carrying the connection it uses, which is where a visitor starts when flagging a passage; when either place is unknown or no route exists, the answer is an empty list rather than a refusal.

```endpoints
Campus.Routing.FindRoute at /route/find
```

A visitor can also ask for the nearest place of a kind, such as a restroom, from where they are: the [nearest-of-a-kind request](reaction:Campus.Routing.FindClosest) carries the start, the text that names the kind (the page offers Restroom, Food, Study space and Lounge, sending "Lavatory", "Food Facility", "Study" and "Lounge", the room-use words in generated names), the step-free flag and the hour, and answers, from the [closest former](former:Campus.Routing.Closest), up to five such places ordered by the cost of reaching them under the same rules as a route. Choosing one makes it the destination. The start, flag and hour are required as for a route, and the text must be text; anything else is refused as an invalid request. An unknown start, or nothing matching, answers an empty list.

```endpoints
Campus.Routing.FindClosest at /route/closest
```

Every place known to the campus map has a position: a building's is its main entrance (the mapped entrance marked main, else the entrance nearest its centre, else the centre of its outline); corridors and rooms placed from the floor plans have their own; a room on such a floor without one takes the position of the corridor it attaches to; and a floor that is a single corridor, with its rooms, shares its building's. A place added with latitude and longitude both 0 has none, and the page leaves such places off the map and out of every distance check. Each route step carries the kind and position of the place it arrives at, and each search result carries a position, so the page draws the route as a line through those positions, with the start and end marked.

Location stays off unless the person turns it on, or, when they are signed in, their saved preference to use their location (see [saved things](Saved.md)) turns it on when the page loads; turning it off stops the page watching at once. While it is on, the page follows progress itself. Only a step that arrives at an entrance (a building, reached by walking outside) is marked done automatically, when a reading is within 40 metres of that building's position, and every step before it is marked done too; inside a building a phone cannot tell where it is, so the person marks indoor steps done by hand, and consecutive walks along corridors are shown as one step. The first step not yet done is highlighted.

The page measures "off course" as the ground distance from a reading to the drawn line. If two readings in a row are more than 75 metres from it, the page asks for the [nearest building](reaction:Campus.Routing.NearestPlace) and finds a new route from there to the same destination, with the same step-free choice and the current time. It then waits for two fresh readings before it can reroute again, since a reading can be off by tens of metres between buildings. When there is no nearest building or no new route, the page says so and keeps the old route. The request carries a latitude and longitude, which must be numbers (anything else is refused as an invalid request), and answers with the closest entrance from the [nearest-place former](former:Campus.Routing.Nearest), or nothing. A person's position is never stored; it is sent only to find the nearest building.

```endpoints
Campus.Routing.NearestPlace at /route/nearest
```

Searching and routing need no account, but flagging and clearing do, so every report belongs to a person (see [accounts](Accounts.md)). A signed-in person can [flag a connection as blocked](reaction:Campus.Problems.BlockLink) with a reason. The endpoint passes the session to `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and the person, never a request input, becomes the report's reporter. The flag takes effect in the connection itself, and the reporter and reason are kept as a report, so the two are recorded in one request. The request carries the session, the connection, and the reason, and answers with the report. The connection is blocked first, and the report is recorded only once the block has succeeded, so a refused block records nothing: an unknown connection is refused with NO_SUCH_LINK, and one that is already blocked with ALREADY_BLOCKED. Because every ride of one elevator shares a service, flagging any ride takes the whole elevator out, and flagging another ride of an elevator that is already out is refused with ALREADY_BLOCKED without a second report. If recording the report fails after the block, the connection stays blocked without a report; anyone can mark it clear and flag it again.

```endpoints
Campus.Problems.BlockLink at /problems/block
Campus.Problems.UnblockLink at /problems/unblock
```

Any signed-in person can [mark a connection as clear again](reaction:Campus.Problems.UnblockLink); the endpoint starts with `Sessioning.use` the same way. Clearing is not limited to the reporter, because a passage would otherwise stay blocked whenever its reporter is gone. Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Campus.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports. The request carries the session and the connection and answers with the connection; an unknown connection is refused with NO_SUCH_LINK, and one that is not blocked with NOT_BLOCKED. Clearing one ride of an elevator clears every ride that shares its service, so [clearing also resolves the reports on those rides](reaction:Campus.Problems.ClearingResolvesSharedReports); otherwise a report against another ride would stay open after the elevator is back.

The map itself is filled in by [adding places](reaction:Campus.Setup.AddPlace) and [connecting them](reaction:Campus.Setup.Connect). In this version these are run by a seed script, which loads the campus map generated from MIT's room inventory, MapIT's room positions, and OpenStreetMap's buildings, entrances and paths, rather than by visitors. Adding a place carries its name, kind, floor, and position; latitude and longitude are required, and the caller sends 0 for both when the position is unknown. It answers with the place, refusing a name already in use with DUPLICATE_PLACE; connecting carries both places and the connection's directions, step-free flag, closing hours, service, and distance and answers with the connection, refusing an unknown place with NO_SUCH_PLACE. These endpoints are deliberately open to anyone in this beta, because the seed script that fills the map runs without signing in; restricting map editing to staff is future work.

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

[Setting preferences](reaction:Saved.Preferences.SetPreferences) carries the session, both flags (step-free routes by default, use my location) and the units for distances (METERS, FEET or MINUTES) and answers with nothing; a request missing any of the three, or with units other than those, is refused as an invalid request and changes nothing. The page applies them when it loads, reporting every distance it shows in those units (minutes at 80 metres a minute); someone who is not signed in can still choose units, which the page keeps on that device only. Journal entries are stored in metres whatever the units.

```endpoints
Saved.Preferences.SetPreferences at /me/preferences/set
```

When a person reaches the end of a route, the page [records the trip](reaction:Saved.Journal.FinishTrip) with the session, the two places and the distance in metres. The page works out the metres itself before sending them: it adds up the metres written in the route's directions ("Walk about 30 m…"), which include the walk to an elevator or stairway written in its directions but nothing for the ride itself, so the figure is an estimate of the walking, and the page says so. It shows the same figure before the trip. After a reroute, the route shown is the new one, from the building it starts at, and that start and its figure are what the page records. The endpoint stores the metres as given. It answers with the entry; an unknown place is refused with NO_SUCH_PLACE and a negative distance with INVALID_DISTANCE. The page sends one finish per route; a repeated request, such as a retry, adds a second entry, which this beta accepts because the totals are estimates.

```endpoints
Saved.Journal.FinishTrip at /me/trips/finish
```

## Concept specifications

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

Ana has never set anything, so she gets the defaults: routes are not restricted to step-free, the app does not use her location, and distances are in metres. She turns on step-free routes and location and asks for distances in walking minutes; the next time she reads her preferences, all three are as she set them. Ben's preferences are still the defaults.

## Types

```types
external User
  The person whose preferences these are.

Units is METERS or FEET or MINUTES
  How distances are reported: metres (kilometres from 1000 m), feet (miles from 1000 ft), or minutes of walking at 80 metres a minute.
```

## State

```state
a set of Preferences with
  a unique user User
  a stepFree Flag
  a useLocation Flag
  a units Units
```

## Actions

```actions
set(user: User, stepFree: Flag, useLocation: Flag, units: Units) : returns ()
  where true
  then
    set the user's preferences to stepFree and useLocation and units, adding them if the user has none
    returns
```

## Queries

```queries
_preferences(user: User) : one (stepFree: Flag, useLocation: Flag, units: Units)
  Answers the user's preferences, or false, false and METERS when the user has never set them; preferences saved before units existed answer METERS for units.
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
  Answers the entrance with a known position closest to the given position, measuring distance along the ground in metres (so a degree of longitude counts for less than a degree of latitude), the one added first on a tie, and nothing when no entrance has a known position or the given position is not on Earth (latitude outside -90 to 90 or longitude outside -180 to 180).
_search(text: String) : many (place: Place, name: String, kind: Kind, floor: Number, latitude: Number, longitude: Number)
  Answers at most 40 places that are not TRANSIT whose name contains the text, ignoring case, with entrances first and then by name in natural number order (so 2 comes before 10); an empty text answers the first 40 places in that order, and no rows when nothing matches.
_closest(source: Place, text: String, accessibleOnly: Flag, hour: Number) : many (place: Place, name: String, floor: Number, cost: Number)
  Answers up to 5 places, other than the source and never TRANSIT, whose names contain the text ignoring case and that a route from the source reaches under the same rules as _route (no blocked connection, none closed at the hour, only accessible ones when accessibleOnly is true), ordered by the cost of that route, the place added first on a tie, each with the route's total cost; no rows when the source is unknown or nothing matches.
_onFloor(building: String, floor: Number) : many (place: Place, name: String, kind: Kind, latitude: Number, longitude: Number)
  Answers every place on the given floor whose name begins with the building followed by a hyphen ("32-" for building 32) and that has a known position, in the order the places were added, and no rows when there are none. Building numbers are matched exactly, so "3-" never matches "32-".
_link(link: Link) : optional (sourceName: String, destinationName: String, forward: String, service: String)
  Answers the names of the connection's two places, its forward directions, and its service when the link is known, and nothing otherwise.
_blocked() : many (link: Link, sourceName: String, destinationName: String, forward: String, service: String)
  Answers every blocked connection with the names of its two places, its forward directions, and its service, in the order the connections were made, and no rows when nothing is blocked.
_sameService(link: Link) : many (other: Link)
  Answers every other connection that shares the link's service, in the order the connections were made, and no rows when the link is unknown or its service is empty.
_route(source: Place, destination: Place, accessibleOnly: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, kind: Kind, floor: Number, distance: Number, latitude: Number, longitude: Number)
  Answers the shortest route from source to destination, where each connection costs the distance it was given when it was made (so a builder can make a short flight of stairs cheaper than waiting for an elevator), as numbered steps starting at 1, each with the distance its connection was given and the kind and position of the place it arrives at, never using a blocked connection or one that is closed at the given hour of the day (0 up to 24, so 6.5 is half past six in the morning), and when accessibleOnly is true never using a connection that is not accessible. Answers no rows when either place is unknown or no route exists, and one row per step in order otherwise. Ties are broken in favor of connections made earlier.
```

## Concept public surfaces

**src/concepts.ts**

import { conceptSet, registerConcept } from "@mit-sdg/sync-engine/assembly";
import type { Db } from "mongodb";
import wayfindingSpec from "@design/concepts/Wayfinding.md" with { type: "text" };
import reportingSpec from "@design/concepts/Reporting.md" with { type: "text" };
import favoritingSpec from "@design/concepts/Favoriting.md" with { type: "text" };
import planningSpec from "@design/concepts/Planning.md" with { type: "text" };
import journalingSpec from "@design/concepts/Journaling.md" with { type: "text" };
import preferringSpec from "@design/concepts/Preferring.md" with { type: "text" };
import {
  AlreadyBlocked,
  DuplicatePlace,
  NoSuchLink,
  NoSuchPlace,
  NotBlocked,
  WayfindingConcept,
} from "./concepts/Wayfinding.ts";
import { ReportingConcept } from "./concepts/Reporting.ts";
import { AlreadyFavorite, FavoritingConcept, NotFavorite } from "./concepts/Favoriting.ts";
import { EmptyTripName, NoSuchTrip, PlanningConcept, TripNameTaken } from "./concepts/Planning.ts";
import { InvalidDistance, JournalingConcept } from "./concepts/Journaling.ts";
import { PreferringConcept } from "./concepts/Preferring.ts";
// Signing in, copied from ConceptBox (github.com/mit-sdg/conceptbox).
import { registering } from "./concepts/Registering/registry.ts";
import { authenticating } from "./concepts/Authenticating/registry.ts";
import { sessioning } from "./concepts/Sessioning/registry.ts";
import { commonsFederating } from "./concepts/Federating/registry.ts";

type Mongo = { database: Db };

const wayfinding = registerConcept({
  class: WayfindingConcept,
  spec: wayfindingSpec,
  refusals: {
    DUPLICATE_PLACE: DuplicatePlace,
    NO_SUCH_PLACE: NoSuchPlace,
    NO_SUCH_LINK: NoSuchLink,
    ALREADY_BLOCKED: AlreadyBlocked,
    NOT_BLOCKED: NotBlocked,
  },
  floors: { mongo: ({ database }: Mongo) => new WayfindingConcept(database) },
});

const reporting = registerConcept({
  class: ReportingConcept,
  spec: reportingSpec,
  floors: { mongo: ({ database }: Mongo) => new ReportingConcept(database) },
});

const favoriting = registerConcept({
  class: FavoritingConcept,
  spec: favoritingSpec,
  refusals: { ALREADY_FAVORITE: AlreadyFavorite, NOT_FAVORITE: NotFavorite },
  floors: { mongo: ({ database }: Mongo, name: string) => new FavoritingConcept(database, name) },
});

const planning = registerConcept({
  class: PlanningConcept,
  spec: planningSpec,
  refusals: { TRIP_NAME_TAKEN: TripNameTaken, EMPTY_TRIP_NAME: EmptyTripName, NO_SUCH_TRIP: NoSuchTrip },
  floors: { mongo: ({ database }: Mongo, name: string) => new PlanningConcept(database, name) },
});

const journaling = registerConcept({
  class: JournalingConcept,
  spec: journalingSpec,
  refusals: { INVALID_DISTANCE: InvalidDistance },
  floors: { mongo: ({ database }: Mongo, name: string) => new JournalingConcept(database, name) },
});

const preferring = registerConcept({
  class: PreferringConcept,
  spec: preferringSpec,
  floors: { mongo: ({ database }: Mongo, name: string) => new PreferringConcept(database, name) },
});

export const applicationConceptSet = conceptSet({
  Wayfinding: wayfinding,
  Reporting: reporting,
  Registering: registering,
  Authenticating: authenticating,
  Sessioning: sessioning,
  CommonsFederating: commonsFederating,
  Favoriting: favoriting,
  Planning: planning,
  Journaling: journaling,
  Preferring: preferring,
});
export const { concepts } = applicationConceptSet;

## Exact starting paths

**.sync-engine/work/frontend-redesign/starting-paths.md**

web/app.ts
web/styles.css
src/concepts/Wayfinding.ts

# Result

Unless the task requests another format, return these headings in order. Omit progress narration.

- `## Status` — required. First line is exactly `Complete` or `Blocked`; explanation goes below.
- `## Changed` — required. Paths changed, or none.
- `## Checks` — required. Exact command and pass/fail outcome.
- `## Blockers` — required. Categorize as design, context, or environment.
- `## Concerns` — optional. Material non-blocking uncertainty only.
