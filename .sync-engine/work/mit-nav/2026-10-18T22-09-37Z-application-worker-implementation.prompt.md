# Role and objective

Work unit `mit-nav`; role `application-worker`; phase `implementation`.

# Application worker

Implement and test the assigned registration, composition, assembly, configuration, boundary, host, and integration work from approved design and concept surfaces. Keep concept implementations, frontend behavior, and authored design read-only unless the task explicitly expands ownership.

Before editing, inventory every selected endpoint, internal reaction, view, former, computation, module/group placement, and endpoint path against the supplied design. Register raw concept classes, refusals, computations, and static instances exactly once. Implement each approved obligation, acknowledgement order, and recovery path through documented composition declarations.

Use the selected transport end to end. Do not invent missing declarations, duplicate owner invariants or effects, bypass the boundary, call concepts directly from a host, or create a parallel product router. Generate artifacts only through project commands.

Repair in-scope wiring and test diagnostics. Do not edit authored design, concept implementation, audit records, or tests outside the write grant, and do not replace required scenarios with skipped or TODO tests. Report a design blocker when every documented realization changes approved behavior, a context blocker when one documented repair leaves the API undetermined, or an environment blocker when checks cannot run.

# Access

Root: "/Users/riceelijah/dev/classes/6104/simmons-nav". The short native message explicitly authorizes reading this prompt file; all assignment context is inline below. This is already a compiled role assignment: do not load a skill, workflow, harness guide, or another instruction file.

- Read: `application:.` ("/Users/riceelijah/dev/classes/6104/simmons-nav").
- Write: `owned-concept:src/concepts/Wayfinding.ts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/concepts/Wayfinding.ts"), `owned-integration:data` ("/Users/riceelijah/dev/classes/6104/simmons-nav/data"), `owned-integration:generated` ("/Users/riceelijah/dev/classes/6104/simmons-nav/generated"), `owned-integration:scripts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/scripts"), `owned-integration:src/assembly.ts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/assembly.ts"), `owned-integration:src/compositions` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/compositions"), `owned-configuration:.gitignore` ("/Users/riceelijah/dev/classes/6104/simmons-nav/.gitignore"), `owned-configuration:AGENTS.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/AGENTS.md"), `owned-configuration:README.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/README.md"), `owned-configuration:generated.config.ts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/generated.config.ts"), `owned-configuration:package.json` ("/Users/riceelijah/dev/classes/6104/simmons-nav/package.json"), `owned-frontend:web` ("/Users/riceelijah/dev/classes/6104/simmons-nav/web"), `owned-test:tests` ("/Users/riceelijah/dev/classes/6104/simmons-nav/tests").
- Tools: `repository-read`, `repository-write`.
- Shell: `project-validation`; network: yes; generated output: yes; long-running processes: no.

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

**.sync-engine/work/mit-nav/tasks/app-worker-search.md**

Implement the approved search design: Wayfinding `_search`, `_link` (optional), `_blocked`; Campus PlaceSearch + SearchPlaces endpoint, ProblemList labelled via `_link`, BlockedList, ShowOverview answering problems + blocked; frontend picker searches the server and the overview shows reports and blocked passages. Tests for the new queries and endpoints. Also move newly downloaded room lists into data/raw/rooms and regenerate data/campus.json.
Checks: generate, check, test, local app.

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

## Authored types

**design/types.md**

# Application types

Visitors have no accounts in this first version. They type a name when they report a problem, and that name is the identity attached to the report.

```types
concrete Person
  A visitor or student who types in their name when reporting a blocked connection.
```

A problem is always reported about a connection between two places, so a report's target is a Wayfinding link.

```instances
instantiate Wayfinding

instantiate Reporting with
  User is Person
  Target is Wayfinding.Link
```

## Compositions

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

## Concept specifications

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

## Concept public surfaces

**src/concepts.ts**

import { conceptSet, registerConcept } from "@mit-sdg/sync-engine/assembly";
import wayfindingSpec from "@design/concepts/Wayfinding.md" with { type: "text" };
import reportingSpec from "@design/concepts/Reporting.md" with { type: "text" };
import {
  AlreadyBlocked,
  DuplicatePlace,
  NoSuchLink,
  NoSuchPlace,
  NotBlocked,
  WayfindingConcept,
} from "./concepts/Wayfinding.ts";
import { ReportingConcept } from "./concepts/Reporting.ts";

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
});

const reporting = registerConcept({ class: ReportingConcept, spec: reportingSpec });

export const applicationConceptSet = conceptSet({ Wayfinding: wayfinding, Reporting: reporting });
export const { concepts } = applicationConceptSet;

## Exact starting paths

**.sync-engine/work/mit-nav/starting-paths.md**

src/compositions/Simmons.ts
src/concepts/Wayfinding.ts
src/assembly.ts
scripts/seed.ts
scripts/floorplan-to-map.ts
web/app.ts
tests/

## Additional directed context

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/api/application-example.md**

# Worked application composition

This example shows documented realization patterns, not required design prose. Approved
design fixes behavioral commitments and declaration links; source chooses stages,
bindings, and disjoint branches that preserve them.

## Endpoint-owned sequencing

An endpoint-linked reaction may perform every action required before its visible success.
Values returned by one action travel to the next stage through `.responds(...)` bindings:

```ts
const PublishPost = endpoint(
  "/board/post",
  ({ session, username, content, post }) =>
    receive({ session, content })
      .then(Sessioning.current({ session }).responds({ subject: username }))
      .then(Posting.publish({ author: username, content }).responds({ post }))
      .then(respond({ post })),
  {
    input: { required: ["session", "content"] },
    validators: { input: sessionContentInput, output: postOutput },
  },
);
```

Do not split a required consequence into a second reaction merely because the behavior
has several steps. If success must acknowledge all required effects, perform those effects
before `respond(...)` unless approved failure semantics explicitly say otherwise.

## Guarded success and total fallback

Sibling branches are alternatives. Give them disjoint conditions and ensure every
admitted request has an answer. A state-dependent success branch may call one action and
then respond; its sibling may return an application error directly:

```ts
const AddComment = endpoint(
  "/board/comment",
  ({ session, username, target, content, comment }) =>
    receive({ session, target, content })
      .then(Sessioning.current({ session }).responds({ subject: username }))
      .then(
        where(Posting._get({ post: target }))
          .then(Commenting.add({ target, author: username, content }).responds({ comment }))
          .then(respond({ comment }))
          .named("post-exists"),
        where(no(Posting._get({ post: target })))
          .then(respond({ error: "POST_NOT_FOUND" }))
          .named("post-missing"),
      ),
  {
    input: { required: ["session", "target", "content"] },
    validators: { input: sessionCommentInput, output: commentOutput },
  },
);
```

`MISSING_ENDPOINT_FALLBACK` means analysis could not establish an answer for every admitted
request. Add a disjoint answer when approved behavior requires one; do not silence the
advisory with an unconditional branch that overlaps a guarded success. When the branches
are intentionally total but conservative analysis still reports the advisory, boundary
evidence—not warning elimination—decides the behavior.

## Computed optional-input branches

A computation is a condition line inside `where(...)`, not an action passed to `.then(...)`.
`reminderSet` comes from `conceptSet(...)`; its second argument is exposed as
`reminderSet.computations`. Use `is.among(flag, [true])` and `is.among(flag, [false])` for
disjoint boolean branches. A computation with no inputs receives `{}`:

```ts
const reminderSet = conceptSet(
  {},
  {
    hasDeadline: ({ dueAt }: { dueAt: string | null }) => dueAt !== null,
    defaultPriority: (_input: Record<string, never>) => "normal",
  },
);

export const CreateReminder = endpoint(
  "/reminders",
  ({ dueAt, hasDeadline, priority }) =>
    receive({ dueAt }).then(
      where(
        compute(reminderSet.computations.hasDeadline, { dueAt }, hasDeadline),
        is.among(hasDeadline, [true]),
      )
        .then(respond({ mode: "scheduled" }))
        .named("with-deadline"),
      where(
        compute(reminderSet.computations.hasDeadline, { dueAt }, hasDeadline),
        is.among(hasDeadline, [false]),
        compute(reminderSet.computations.defaultPriority, {}, priority),
      )
        .then(respond({ mode: "open", priority }))
        .named("without-deadline"),
    ),
  { input: { defaults: { dueAt: null } } },
);
```

The endpoint contract supplies `null` when the optional field is absent; one
`receive(...)` handles both branches.

## Intentionally separate reaction

Use a separate reaction only when approved design selects a distinct internal reaction
link. Trigger it from a real concept action or outcome whose bindings supply the
consequence:

```ts
const SelectedReadingOpensDiscussion = reaction(({ selection }) =>
  // An empty input pattern ({}) matches any choose regardless of scope or item.
  when(Selecting.choose({}).responds({ selection })).then(Discussing.open({ subject: selection })),
);
```

Do not target an endpoint path or declaration name through `returned(..., { by })` unless
a supplied public contract explicitly defines that occurrence. Do not duplicate the
reaction's consequence inside its triggering endpoint.

## Linked placement and assembly

Place declarations under the exact groups named by accepted links, then register that
group record under its module:

```ts
export const boardComposition = {
  BoardPublishing: { PublishPost },
  BoardComments: { AddComment },
};

export const circleComposition = {
  ReadingDiscussion: { SelectedReadingOpensDiscussion },
};

assemble({
  conceptSet: applicationConceptSet,
  instances: applicationConceptSet.implementations(),
  composition: { Board: boardComposition, Circle: circleComposition },
});
```

Use the project's generation, application check, typecheck, and black-box boundary tests
as the repair loop. Public generated wire declarations may be read as caller contracts.
If documented constructions cannot preserve an approved behavioral commitment, report the
blocker instead of discovering alternate API shapes by runtime reflection.

# Result

Unless the task requests another format, return these headings in order. Omit progress narration.

- `## Status` — required. First line is exactly `Complete` or `Blocked`; explanation goes below.
- `## Changed` — required. Paths changed, or none.
- `## Checks` — required. Exact command and pass/fail outcome.
- `## Blockers` — required. Categorize as design, context, or environment.
- `## Concerns` — optional. Material non-blocking uncertainty only.
