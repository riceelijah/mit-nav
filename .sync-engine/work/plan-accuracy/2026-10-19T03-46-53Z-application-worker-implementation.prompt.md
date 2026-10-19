# Role and objective

Work unit `plan-accuracy`; role `application-worker`; phase `implementation`.

# Application worker

Implement and test the assigned registration, composition, assembly, configuration, boundary, host, and integration work from approved design and concept surfaces. Keep concept implementations, frontend behavior, and authored design read-only unless the task explicitly expands ownership.

Before editing, inventory every selected endpoint, internal reaction, view, former, computation, module/group placement, and endpoint path against the supplied design. Register raw concept classes, refusals, computations, and static instances exactly once. Implement each approved obligation, acknowledgement order, and recovery path through documented composition declarations.

Use the selected transport end to end. Do not invent missing declarations, duplicate owner invariants or effects, bypass the boundary, call concepts directly from a host, or create a parallel product router. Generate artifacts only through project commands.

Repair in-scope wiring and test diagnostics. Do not edit authored design, concept implementation, audit records, or tests outside the write grant, and do not replace required scenarios with skipped or TODO tests. Report a design blocker when every documented realization changes approved behavior, a context blocker when one documented repair leaves the API undetermined, or an environment blocker when checks cannot run.

# Access

Root: "/Users/riceelijah/dev/classes/6104/simmons-nav". The short native message explicitly authorizes reading this prompt file; all assignment context is inline below. This is already a compiled role assignment: do not load a skill, workflow, harness guide, or another instruction file.

- Read: `application:.` ("/Users/riceelijah/dev/classes/6104/simmons-nav").
- Write: `owned-concept:src/concepts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/concepts"), `owned-integration:.dockerignore` ("/Users/riceelijah/dev/classes/6104/simmons-nav/.dockerignore"), `owned-integration:AGENTS.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/AGENTS.md"), `owned-integration:README.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/README.md"), `owned-integration:compose.yaml` ("/Users/riceelijah/dev/classes/6104/simmons-nav/compose.yaml"), `owned-integration:data` ("/Users/riceelijah/dev/classes/6104/simmons-nav/data"), `owned-integration:generated` ("/Users/riceelijah/dev/classes/6104/simmons-nav/generated"), `owned-integration:package.json` ("/Users/riceelijah/dev/classes/6104/simmons-nav/package.json"), `owned-integration:scripts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/scripts"), `owned-integration:src/compositions` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/compositions"), `owned-integration:src/main.ts` ("/Users/riceelijah/dev/classes/6104/simmons-nav/src/main.ts"), `owned-frontend:web` ("/Users/riceelijah/dev/classes/6104/simmons-nav/web"), `owned-test:tests` ("/Users/riceelijah/dev/classes/6104/simmons-nav/tests").
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

**.sync-engine/work/plan-accuracy/tasks/app.md**

Implement the approved plan-accuracy + audit-fix design:
- scripts/seed.ts writes data/campus.json straight into the database, updating in place (identity by place name; connection identity apart from metres; blocked kept; new rides of a blocked service start blocked; removals with favorites/trips; resolve open reports on missing connections). Remove the Campus.Setup endpoints; tests add places through the concept.
- Input validators: FindRoute/FindClosest (text places, boolean flag, hour 0–24), SaveTrip (text name/places, boolean flag), FinishTrip (text places, number metres); Journaling.finish refuses over 100 km.
- Converter: tolerant OCR label matching (unique only), rooms attach to two nearest corridors within 25 m, steps with a wheelchair ramp are step-free, sidewalks named after the nearest named street within 25 m, floor "00" is floor -1.
- Frontend: outdoor steps split by street with turns, entrance walk merged into the outdoor step, Saved tab signed-out message, mobile sheet starts at peek, MIT-drawing option in the floor switcher when a fitted drawing exists; server serves drawings from data/raw/drawings when present and 404s missing plan files.
- scripts/fit-drawings.py fits downloaded PDFs; stale check-api fixed; dead code; README; .dockerignore.
- Tests, regenerate data, check.

## Brief

**.sync-engine/work/plan-accuracy/brief.md**

# Plan accuracy and audit fixes

## Goal

Act on a check of the generated plans against MIT's PDFs (Stata floor 1, Building 10 floor 1): room positions match MIT's labels to a 0.2 m median, but some rooms are dropped because MapIT's label readings are garbled, Stata's open student street is not part of the corridor network so routes double back, and room shapes ignore walls. Add the user's second plan option: MIT's own drawing, traced from the PDFs, as a plan layer where the traced files exist.

## Scope

- Audit fixes (the user asked to fix every audit finding without losing any app functionality): remove the open Setup endpoints (anyone could add places or connections); the seed script writes the generated map straight into Wayfinding's collections and updates it in place on re-runs, keeping place and connection identities (so favorites, trips, history and blocks survive a map update) and leaving accounts alone; input checks on trips (text name and places, boolean flag), finished-trip metres (number, 0 to 100 km in Journaling) and route/closest requests (boolean flag, hour 0 to 24); sidewalks named after the street beside them and outdoor steps split by street with turn words; the entrance walk merged into the outdoor step; floor "00" as floor -1; Docker image without data/raw; README accuracy; a plan file that does not exist answers 404; the stale API check script fixed; dead code removed; the Saved tab's signed-out message; the mobile sheet opening at its peek when a route is restored; buildings cut off from step-free routes investigated.

- Included: tolerant matching of MapIT labels that differ from inventory numbers only by common OCR confusions (L/1/I, O/0/D/Q, S/5, B/8, Z/2, G/6, T/7), used only when unique on the floor (this recovers Stata's main street lobby 32-100LA, read as "1001A"); each room attaching to its two nearest corridors within 25 m (at least the nearest); an MIT-drawing layer: a local script (scripts/fit-drawings.py) OCRs each downloaded PDF in data/raw/pdfs, fits it to the floor plan's label positions (similarity transform), and writes the drawing image and its fit to data/raw/drawings; the frontend serves those when present, and the floor switcher offers "Schematic" and "MIT drawing" for such floors; design prose.
- Excluded: publishing traced drawings (data/raw stays out of git; MIT Facilities requires written permission to copy or display its drawings), routing along walls.

## Requirements

- Recovered labels never steal a position: a garbled label is used only when exactly one unmatched inventory room on that floor normalises to it.
- A route into Stata to 32-123 no longer walks past the hall to a lobby label and back.
- The MIT drawing appears only when its file exists; the deployed app without data/raw shows the schematic only and offers no drawing option.
- A fitted drawing is kept only with at least 6 matched labels and a median error of 2 m or less.

## Active decisions

- Traced drawings stay local by default; publishing them is the user's decision after asking Facilities (fis-request@mit.edu).
- Large open rooms are not made into corridors: the street is already lobbies, and its main lobby was missing only through a misread label. The 25 m two-sided attachment is a heuristic; checked against the Stata route.
- Execution mixed: designer and implementation simulated; critic delegated.

## Done when

- check, tests pass; check script reruns on Stata 1 and Building 10 1 show more rooms drawn; Simmons → 32-123 enters 32-123 from the near side; the MIT drawing toggles on for floors with PDFs and is absent otherwise.

## Open questions

None.

## Activity

- Work item started after checking plans against MIT PDFs (Stata 1: 16 labels, 0.2 m median, max 0.4 m; Building 10 1: 60 of 62 labels drawn, 0.2 m median, two rooms 6–8 m off).
- Narrowed: open rooms stay rooms; the drawing layer is the fitted PDF image, not traced vectors.
- Scope widened after an audit; the earlier critic run was cancelled before it ran.
- First verification was run by a fresh critic instance (recorded under the original critic's id); it found R1/R2 and F3/F4 open. Later rounds go to the original critic.

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

**design/compositions/Campus.md**

# MIT campus navigation

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks along OpenStreetMap's footpaths, sidewalks and crossings; a walk that uses steps, or a path marked as not for wheelchairs, is not step-free, unless the steps are mapped with a wheelchair ramp alongside or as usable by wheelchairs. Each building joins the paths at each of its mapped entrances, or at the path point nearest it when it has none; a building with no path within 80 metres is joined by straight walks to its nearest buildings instead, so it stays reachable. Path points are only passed through and are never named in directions; a sidewalk without a name of its own takes the name of the street it runs beside (the nearest named street within 25 metres), and a crossing is called a crosswalk. The page shows consecutive outdoor walks along the same street as one step that adds up their metres, starting a new step where the name changes, with the turn there (left, right, slight left or right, or straight on, from the change in heading); unnamed stretches join the step before them. The short walk from the paths to a building's entrance ends the outdoor step before it, so arriving at the entrance is part of that step. Inside the buildings whose room lists have been converted, each floor is a network of its corridors, lobbies and bridges, placed where MIT's floor plans put them and joined to one another by walking distance: each corridor to its three nearest corridors within 40 metres, then, while the floor is in separate pieces, the closest pair of corridors joining two pieces. Each corridor is a place that is only passed through, named by its room number and use ("32-100LA Lobby"); room numbers are unique and corridors are never also listed as rooms, so these names never collide with a room's. MIT's floor plans give positions by room label, and those labels were read off the drawings by machine, so some are misread ("1001A" for 100LA, "1448" for 144B); a label that matches no room on its floor is read again treating L, I and 1, O, D, Q and 0, S and 5, B and 8, Z and 2, G and 6, and T and 7 as the same, and placed only when exactly one unplaced room on that floor reads the same way. Every room with a known position attaches to the corridor nearest it, and also to the next nearest when that one is within 25 metres, so a large room such as a lecture hall can be reached from either side; a room without one attaches to the corridor nearest the middle of that floor's corridors and takes that corridor's position. Elevators and stairs are not places: each ride or flight is a connection that starts and ends at the corridor nearest its stop or landing on each floor (or the floor's middle corridor when the stop has no position). A floor whose corridors have no known positions is a single corridor instead, with its rooms opening off it.

A connection's distance is a cost, not a length: walking inside costs 0.2 plus the metres walked over 50, walking outside along a path the metres over 50, and the walk between a building's door and the paths, or a straight walk between two buildings far from any path, 1 plus the metres over 50, so a path is not penalised for its bends, and an elevator ride 3.5 plus half a unit per floor plus the walks to and from it. The route is the cheapest trip under those costs, so it takes the elevator that makes the whole trip shortest, counting the walk to each elevator, rather than simply the one nearest the destination. Each connection's directions carry the metres themselves ("Walk about 30 m to elevator E3 and take it up to floor 4"), and when the page shows several corridor walks in a row as one step, it adds up the metres written in them.

The ground floor is floor 1, or the lowest floor above it when there is no floor 1, or the lowest floor. A building is entered from the corridor nearest each of its OpenStreetMap entrances within 15 metres of its outline; with no such entrance, or when the ground floor is a single corridor, it is entered at the corridor nearest the building's centre, or at that single corridor. Two buildings whose outlines touch are joined indoors on a floor when each has a corridor on that floor within 35 metres of the other's outline, joining each building's corridor nearest the other building's outline; the floor plans mark a corridor at its middle, so corridors that meet at a shared wall are usually 20 to 50 metres apart as marked. Corridors of any two buildings within 15 metres of each other on a floor, such as the two ends of a bridge, are joined as well. When either building's floor has no positions, they are joined on that floor if their outlines touch, from each building's corridor nearest the other's centre (or its single corridor).

Simmons Hall is generated from its room list like every other building. The campus has thousands of places and connections, so the app never sends the whole map to the browser. A visitor finds a place by typing part of its name: the [place search](former:Campus.Browsing.PlaceSearch) answers at most 40 matching places that can be a start or a destination, with entrances first (every building is an entrance), and the [search request](reaction:Campus.Browsing.SearchPlaces) carries the typed text and answers with those places; when nothing matches the answer is an empty list, not a refusal. Anyone can also see the problems reported so far: the [problem list](former:Campus.Browsing.ProblemList) lists open reports, each with the reporter's username from `Registering._username` (a report whose reporter has no username, such as one made before accounts existed, is still listed, with no name, so an open problem is never hidden), the names of its connection's two places and its directions, and the [blocked list](former:Campus.Browsing.BlockedList) lists every blocked connection the same way, including any blocked without a report, so it can still be marked clear. The [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both lists. Generated place names begin with the building ("Building 32, floor 1", "32-123 Lecture Hall"), so typing a building or room number finds them.

The page can also show floor plans. With the campus map the converter writes one plan file per converted building, which the frontend serves: the building's outline and, for each floor (named as MIT names it, such as "1" or "G4", with the same floor number its places carry, so "G4" is floor 4, and "00", the level below "0", is floor -1), every room MIT's inventory places there with a position (offices, labs, closets, shafts, stairs, elevators, corridors, everything), with its room number, use, position and floor area. These rooms are drawn, not routed: only the places described above are in the map, so a closet never appears in search or in a route. The page draws each room as the part of the building's outline nearer its position than any other room's on that floor, cut to a square of one and a half times its floor area around it, turned to line up with the outline's longest edge (a room with no area keeps its whole region); it labels each with its room number, tints corridors, lobbies and bridges, marks elevators and stairs, highlights the destination, and draws every plan beneath the route line. It is a schematic of where rooms are and how big they are, not MIT's drawing of the walls, and the page says so. Where MIT's own drawing of a floor has been downloaded and fitted to the map, the page can show that instead: a separate local step reads the room labels on the drawing, fits the drawing to the map by the positions of the labels it shares with the floor plans (turning, scaling and moving it, never stretching it), and keeps the fit only when at least 6 labels match and half of them land within 2 metres of their positions; the frontend serves each fitted drawing with its fit, and the floor switcher then offers "Schematic" and "MIT drawing" for that floor, remembering the choice. These drawings stay on the machine that made them, out of the repository and the deployed app, because MIT Facilities requires written permission to copy or display them; without them the page shows the schematic only and offers no choice. The page tells which building a route step is in from the building number its generated name begins with ("32-"). At zoom 18 and closer it shows the plan of each building on the route whose outline is in view, and hides them when zoomed out; to open one by hand, the route panel lists the route's buildings, and choosing one zooms the map to it. The panel lists no floors: while a building's plan shows, a floor switcher on the map lists the floors in that building's plan file, marks those whose floor number a route step in that building carries, and switches the plan; the plan opens on the floor of the step the person is on when that step is in the building, otherwise on the first floor the route uses there, and follows the current step to other floors.

```endpoints
Campus.Browsing.ShowOverview at /map/overview
Campus.Browsing.SearchPlaces at /map/search
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because a passage can be closed at some hours of the day; the generated campus map has no closing hours yet, so today every hour gives the same route. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps, each carrying the connection it uses, which is where a visitor starts when flagging a passage; when either place is unknown or no route exists, the answer is an empty list rather than a refusal. The places must be text, the step-free flag true or false, and the hour a number from 0 to 24; anything else is refused with INVALID_REQUEST. Such checks, here and in every endpoint below, are made by the endpoint's input validator on the request alone, before any concept is consulted.

```endpoints
Campus.Routing.FindRoute at /route/find
```

A visitor can also ask for the nearest place of a kind, such as a restroom, from where they are: the [nearest-of-a-kind request](reaction:Campus.Routing.FindClosest) carries the start, the text that names the kind (the page offers Restroom, Food, Study space and Lounge, sending "Lavatory", "Food Facility", "Study" and "Lounge", the room-use words in generated names), the step-free flag and the hour, and answers, from the [closest former](former:Campus.Routing.Closest), up to five such places ordered by the cost of reaching them under the same rules as a route. Choosing one makes it the destination. The start, flag and hour are required and checked as for a route, and the text must be text; anything else is refused with INVALID_REQUEST. An unknown start, or nothing matching, answers an empty list.

```endpoints
Campus.Routing.FindClosest at /route/closest
```

Every place known to the campus map has a position: a building's is its main entrance (the mapped entrance marked main, else the entrance nearest its centre, else the centre of its outline); corridors and rooms placed from the floor plans have their own; a room on such a floor without one takes the position of the corridor it attaches to; and a floor that is a single corridor, with its rooms, shares its building's. A place added with latitude and longitude both 0 has none, and the page leaves such places off the map and out of every distance check. Each route step carries the kind and position of the place it arrives at, and each search result carries a position, so the page draws the route as a line through those positions, with the start and end marked.

Location stays off unless the person turns it on, or, when they are signed in, their saved preference to use their location (see [saved things](Saved.md)) turns it on when the page loads; turning it off stops the page watching at once. While it is on, the page follows progress itself. Only a step that arrives at an entrance (a building, reached by walking outside) is marked done automatically, when a reading is within 40 metres of that building's position, and every step before it is marked done too; inside a building a phone cannot tell where it is, so the person marks indoor steps done by hand, and consecutive walks along corridors are shown as one step. The first step not yet done is highlighted.

The page measures "off course" as the ground distance from a reading to the drawn line. If two readings in a row are more than 75 metres from it, the page asks for the [nearest building](reaction:Campus.Routing.NearestPlace) and finds a new route from there to the same destination, with the same step-free choice and the current time. It then waits for two fresh readings before it can reroute again, since a reading can be off by tens of metres between buildings. When there is no nearest building or no new route, the page says so and keeps the old route. The request carries a latitude and longitude, which must be numbers (anything else is refused with INVALID_REQUEST), and answers with the closest entrance from the [nearest-place former](former:Campus.Routing.Nearest), or nothing. A person's position is never stored; it is sent only to find the nearest building.

```endpoints
Campus.Routing.NearestPlace at /route/nearest
```

Searching and routing need no account, but flagging and clearing do, so every report belongs to a person (see [accounts](Accounts.md)). A signed-in person can [flag a connection as blocked](reaction:Campus.Problems.BlockLink) with a reason. The endpoint passes the session to `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and the person, never a request input, becomes the report's reporter. The flag takes effect in the connection itself, and the reporter and reason are kept as a report, so the two are recorded in one request. The request carries the session, the connection, and the reason, and answers with the report. The connection is blocked first, and the report is recorded only once the block has succeeded, so a refused block records nothing: an unknown connection is refused with NO_SUCH_LINK, and one that is already blocked with ALREADY_BLOCKED. Because every ride of one elevator shares a service, flagging any ride takes the whole elevator out, and flagging another ride of an elevator that is already out is refused with ALREADY_BLOCKED without a second report. If recording the report fails after the block, the connection stays blocked without a report; anyone can mark it clear and flag it again.

```endpoints
Campus.Problems.BlockLink at /problems/block
Campus.Problems.UnblockLink at /problems/unblock
```

Any signed-in person can [mark a connection as clear again](reaction:Campus.Problems.UnblockLink); the endpoint starts with `Sessioning.use` the same way. Clearing is not limited to the reporter, because a passage would otherwise stay blocked whenever its reporter is gone. Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Campus.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports. The request carries the session and the connection and answers with the connection; an unknown connection is refused with NO_SUCH_LINK, and one that is not blocked with NOT_BLOCKED. Clearing one ride of an elevator clears every ride that shares its service, so [clearing also resolves the reports on those rides](reaction:Campus.Problems.ClearingResolvesSharedReports); otherwise a report against another ride would stay open after the elevator is back.

The map itself is not editable over the API: there are no endpoints for adding places or connections, so a visitor cannot change it. A seed script, run by whoever deploys the app, fills it. The script is an operator tool outside the application, like a database migration, and runs only while the app is stopped, so it is the only writer while it runs and enforces the rules below itself: it writes the campus map generated from MIT's room inventory, MapIT's room positions, and OpenStreetMap's buildings, entrances and paths straight into Wayfinding's state by the rules below, and running it again with the same map changes nothing, so a run that stops partway is repaired by running it again. Running it after the map is regenerated updates the map in place rather than starting over. A place whose name is unchanged keeps its identity, with its kind, floor and position updated, so favorites, saved trips and history that refer to it keep working. A connection keeps its identity when it joins the same two places in the same direction with the same directions apart from their metres ("Walk about 30 m to stairway SA" and "Walk about 32 m to stairway SA" are the same connection), with its other details updated and whether it is blocked kept; a new connection that shares a service with a blocked one starts blocked, since that elevator is still out. Places and connections no longer in the map are removed, and favorites and saved trips that refer to a removed place are removed with it (history entries are kept, so totals still count them). Every run, after removing, resolves every open report whose connection is no longer in the map, so a run that stopped partway leaves no report open on a passage that is gone once it is run again. Accounts, sessions, preferences, history and every other report are left alone.

**design/compositions/Saved.md**

# Saved things

A signed-in person keeps their own favorites, saved trips, preferences and trip journal. Every endpoint here starts with `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and acts on that person only: nobody can read or change another person's things, because no endpoint takes a person as an input.

The [my-things request](reaction:Saved.Mine.ShowMine) carries the session and answers with everything the person has kept: [their favorites](former:Saved.Mine.MyFavorites), each with the place's name, kind and floor from `Wayfinding._place`, newest first; [their saved trips](former:Saved.Mine.MyTrips), each with the names of its two places; [their preferences](former:Saved.Mine.MyPreferences); [their recent trips](former:Saved.Mine.MyHistory), newest first, with place names; and [their totals](former:Saved.Mine.MyTotals), the number of finished trips and the estimated metres. Favorites, trips and journal entries are only ever kept for places on the map, but a place can leave the map when it is regenerated (see [the campus map](Campus.md)); the seed removes favorites and saved trips that refer to a removed place along with it (so a trip's name is free again), and a history entry whose place is gone is no longer listed, while the totals still count every entry.

```endpoints
Saved.Mine.ShowMine at /me
```

[Favoriting a place](reaction:Saved.Favorites.Favorite) carries the session and the place; a place `Wayfinding._place` does not know is refused with NO_SUCH_PLACE before anything is kept, and a place already favorited is refused with ALREADY_FAVORITE. [Unfavoriting](reaction:Saved.Favorites.Unfavorite) carries the same and refuses a place that is not a favorite with NOT_FAVORITE. Both answer with nothing.

```endpoints
Saved.Favorites.Favorite at /me/favorites/add
Saved.Favorites.Unfavorite at /me/favorites/remove
```

[Saving a trip](reaction:Saved.Trips.SaveTrip) carries the session, a name, the two places and the step-free flag, and answers with the trip; a source or destination `Wayfinding._place` does not know is refused with NO_SUCH_PLACE before anything is kept, a name the person already uses is refused with TRIP_NAME_TAKEN and an empty one with EMPTY_TRIP_NAME. The name and places must be text and the step-free flag true or false; anything else is refused with INVALID_REQUEST. [Removing a trip](reaction:Saved.Trips.RemoveTrip) carries the session and the trip and answers with nothing; a trip that is not the person's own is refused with NO_SUCH_TRIP, the same as one that does not exist, so nobody learns about another person's trips.

```endpoints
Saved.Trips.SaveTrip at /me/trips/save
Saved.Trips.RemoveTrip at /me/trips/remove
```

[Setting preferences](reaction:Saved.Preferences.SetPreferences) carries the session, both flags (step-free routes by default, use my location) and the units for distances (METERS, FEET or MINUTES) and answers with nothing; a request missing any of the three, or with units other than those, is refused with INVALID_REQUEST and changes nothing. The page applies them when it loads, reporting every distance it shows in those units (minutes at 80 metres a minute); someone who is not signed in can still choose units, which the page keeps on that device only. Journal entries are stored in metres whatever the units.

```endpoints
Saved.Preferences.SetPreferences at /me/preferences/set
```

When a person reaches the end of a route, the page [records the trip](reaction:Saved.Journal.FinishTrip) with the session, the two places and the distance in metres. The page works out the metres itself before sending them: it adds up the metres written in the route's directions ("Walk about 30 m…"), which include the walk to an elevator or stairway written in its directions but nothing for the ride itself, so the figure is an estimate of the walking, and the page says so. It shows the same figure before the trip. After a reroute, the route shown is the new one, from the building it starts at, and that start and its figure are what the page records. The endpoint stores the metres as given. It answers with the entry; the checks run in this order, and the first that fails is the answer: places that are not text or metres that are not a number are refused with INVALID_REQUEST, an unknown place with NO_SUCH_PLACE, and a negative distance or one over 100 km with INVALID_DISTANCE. The page sends one finish per route; a repeated request, such as a retry, adds a second entry, which this beta accepts because the totals are estimates.

```endpoints
Saved.Journal.FinishTrip at /me/trips/finish
```

## Concept specifications

**design/concepts/Journaling.md**

# Journaling

## Purpose

Keep a record of the trips each person finishes, so they can look back at where they have been and see how far they have gone in total.

## Principle

Ana finishes a trip from Simmons Hall to 32-G904 of about 900 metres, then one back of about 900 metres. Her history lists the trip back first, and her totals are 2 trips and 1800 metres. Ben, who has finished nothing, sees an empty history and totals of 0 trips and 0 metres. A finished trip with a negative distance, or one longer than 100 km (no walk across campus is), is refused and leaves her totals as they were.

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
  where meters is less than 0 or more than 100000
  then
    refuses INVALID_DISTANCE "A trip is between 0 and 100 km."
  where meters is at least 0 and at most 100000
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

**src/concepts/Journaling.ts**

import type { Collection, Db } from "mongodb";

export class InvalidDistance extends Error {}

interface EntryDoc {
  _id: string;
  traveller: string;
  source: string;
  destination: string;
  meters: number;
  order: number;
}

const RECENT = 20;

/** The trips each person finishes, and how far they have gone in total. */
export class JournalingConcept {
  private readonly entries: Collection<EntryDoc>;

  constructor(database: Db, name = "Journaling") {
    this.entries = database.collection(`${name.toLowerCase()}.entries`);
  }

  async finish({ traveller, source, destination, meters }: { traveller: string; source: string; destination: string; meters: number }) {
    if (!(meters >= 0)) throw new InvalidDistance("A trip cannot be shorter than nothing.");
    const entry = crypto.randomUUID();
    // ponytail: order by a per-traveller count; two finishes in the same instant could tie, which only reorders them.
    const order = await this.entries.countDocuments({ traveller });
    await this.entries.insertOne({ _id: entry, traveller, source, destination, meters, order });
    return { entry };
  }

  async _history({ traveller }: { traveller: string }) {
    const rows = await this.entries.find({ traveller }).sort({ order: -1 }).limit(RECENT).toArray();
    return rows.map((e) => ({ entry: e._id, source: e.source, destination: e.destination, meters: e.meters }));
  }

  async _totals({ traveller }: { traveller: string }) {
    const [sum] = await this.entries
      .aggregate<{ trips: number; meters: number }>([
        { $match: { traveller } },
        { $group: { _id: null, trips: { $sum: 1 }, meters: { $sum: "$meters" } } },
      ])
      .toArray();
    return { trips: sum?.trips ?? 0, meters: sum?.meters ?? 0 };
  }
}

**src/concepts/Wayfinding.ts**

import { MongoServerError, type Collection, type Db } from "mongodb";

export class DuplicatePlace extends Error {}
export class NoSuchPlace extends Error {}
export class NoSuchLink extends Error {}
export class AlreadyBlocked extends Error {}
export class NotBlocked extends Error {}

export type Kind = "ENTRANCE" | "HALLWAY" | "ROOM" | "TRANSIT";

interface PlaceDoc {
  _id: string;
  name: string;
  kind: Kind;
  floor: number;
  latitude: number;
  longitude: number;
  order: number;
}

interface LinkDoc {
  _id: string;
  order: number;
  source: string;
  destination: string;
  forward: string;
  backward: string;
  accessible: boolean;
  blocked: boolean;
  closedFrom: number;
  closedUntil: number;
  service: string;
  distance: number;
}

const SEARCH_LIMIT = 40;
const CLOSEST = 5;
// Building and room numbers sort the way people read them: 2 before 10, 32-123 before 32-G904.
const byName = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

/** Closed from `from` up to `until`, wrapping past midnight; equal values mean never closed. */
function isClosed(from: number, until: number, hour: number) {
  if (from === until) return false;
  return from < until ? hour >= from && hour < until : hour >= from || hour < until;
}

/** Distance along the ground in metres; flat-earth is exact enough across a campus. */
export function groundMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const metersPerDegree = 111_320;
  const x = (lon2 - lon1) * metersPerDegree * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const y = (lat2 - lat1) * metersPerDegree;
  return Math.hypot(x, y);
}

/** A connection as people read it: its two places by name, its directions, and its service. */
async function describe(places: Collection<PlaceDoc>, l: LinkDoc) {
  const [source, destination] = await Promise.all([places.findOne({ _id: l.source }), places.findOne({ _id: l.destination })]);
  return { sourceName: source?.name ?? "?", destinationName: destination?.name ?? "?", forward: l.forward, service: l.service ?? "" };
}

/**
 * Dijkstra from `source` until `stop` says to: the cheapest cost to each place reached, how it was reached,
 * and the places in the order they were settled (cheapest first, earliest discovered on a tie).
 */
function cheapest(links: LinkDoc[], source: string, accessibleOnly: boolean, hour: number, stop: (place: string) => boolean) {
  const settled: string[] = [];
  // Dijkstra finds the cheapest route. Each connection costs the distance it was given when it was made.
  // Blocked connections and ones closed at this hour are never used, and neither are inaccessible ones when asked to avoid them.
  const usable = links.filter(
    (l) => !l.blocked && !isClosed(l.closedFrom ?? 0, l.closedUntil ?? 0, hour) && (!accessibleOnly || l.accessible),
  );
  const next = new Map<string, { link: LinkDoc; to: string; instruction: string }[]>();
  for (const l of usable) {
    (next.get(l.source) ?? next.set(l.source, []).get(l.source)!).push({ link: l, to: l.destination, instruction: l.forward });
    (next.get(l.destination) ?? next.set(l.destination, []).get(l.destination)!).push({ link: l, to: l.source, instruction: l.backward });
  }
  const dist = new Map<string, number>([[source, 0]]);
  const came = new Map<string, { from: string; link: LinkDoc; instruction: string }>();
  const done = new Set<string>();
  // Binary heap of [distance, discovery order, place]: the smallest distance comes out first, and the
  // place discovered earliest wins a tie, so ties still go to connections made earlier.
  const order = new Map<string, number>([[source, 0]]);
  const heap: [number, number, string][] = [[0, 0, source]];
  const less = (a: [number, number, string], b: [number, number, string]) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const push = (item: [number, number, string]) => {
    heap.push(item);
    for (let i = heap.length - 1; i > 0; ) {
      const parent = (i - 1) >> 1;
      if (!less(heap[i], heap[parent])) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, , here] = pop();
    if (done.has(here) || d > dist.get(here)!) continue; // a stale entry for a place already improved
    settled.push(here);
    if (stop(here)) break;
    done.add(here);
    for (const edge of next.get(here) ?? []) {
      if (done.has(edge.to)) continue;
      const candidate = d + (edge.link.distance ?? 1);
      if (!order.has(edge.to)) order.set(edge.to, order.size);
      if (!dist.has(edge.to) || candidate < dist.get(edge.to)!) {
        dist.set(edge.to, candidate);
        came.set(edge.to, { from: here, link: edge.link, instruction: edge.instruction });
        push([candidate, order.get(edge.to)!, edge.to]);
      }
    }
  }
  return { dist, came, settled };
}

export class WayfindingConcept {
  private readonly places: Collection<PlaceDoc>;
  private readonly links: Collection<LinkDoc>;
  private indexed = false;

  constructor(db: Db) {
    this.places = db.collection<PlaceDoc>("wayfinding.places");
    this.links = db.collection<LinkDoc>("wayfinding.links");
  }

  async addPlace({ name, kind, floor, latitude, longitude }: { name: string; kind: Kind; floor: number; latitude: number; longitude: number }) {
    if (!this.indexed) {
      // The unique index is what stops two places from sharing a name, even in a race.
      await this.places.createIndex({ name: 1 }, { unique: true });
      this.indexed = true;
    }
    const place = crypto.randomUUID();
    try {
      const order = await this.places.countDocuments({});
      await this.places.insertOne({ _id: place, name, kind, floor, latitude, longitude, order });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new DuplicatePlace("A place with that name already exists.");
      }
      throw error;
    }
    return { place };
  }

  async connect({
    source,
    destination,
    forward,
    backward,
    accessible,
    closedFrom,
    closedUntil,
    service,
    distance,
  }: {
    source: string;
    destination: string;
    forward: string;
    backward: string;
    accessible: boolean;
    closedFrom: number;
    closedUntil: number;
    service: string;
    distance: number;
  }) {
    const found = await this.places.countDocuments({ _id: { $in: [source, destination] } });
    const needed = source === destination ? 1 : 2;
    if (found !== needed) {
      throw new NoSuchPlace("Both places must exist before they can be connected.");
    }
    const link = crypto.randomUUID();
    const order = await this.links.countDocuments({});
    await this.links.insertOne({
      _id: link,
      order,
      source,
      destination,
      forward,
      backward,
      accessible,
      blocked: false,
      closedFrom,
      closedUntil,
      service,
      distance,
    });
    return { link };
  }

  async block({ link }: { link: string }) {
    const existing = await this.links.findOne({ _id: link });
    if (!existing) throw new NoSuchLink("There is no such connection.");
    if (existing.blocked) throw new AlreadyBlocked("That connection is already blocked.");
    await this.links.updateOne({ _id: link }, { $set: { blocked: true } });
    // Everything that depends on the same service goes out with it.
    if (existing.service) await this.links.updateMany({ service: existing.service }, { $set: { blocked: true } });
    return { link };
  }

  async unblock({ link }: { link: string }) {
    const existing = await this.links.findOne({ _id: link });
    if (!existing) throw new NoSuchLink("There is no such connection.");
    if (!existing.blocked) throw new NotBlocked("That connection is not blocked.");
    await this.links.updateOne({ _id: link }, { $set: { blocked: false } });
    if (existing.service) await this.links.updateMany({ service: existing.service }, { $set: { blocked: false } });
    return { link };
  }

  async _places(_input: Record<string, never>) {
    const rows = await this.places.find({}).toArray();
    return rows
      .sort((a, b) => a.floor - b.floor || (a.order ?? 0) - (b.order ?? 0))
      .map(({ _id, name, kind, floor }) => ({ place: _id, name, kind, floor }));
  }

  async _links(_input: Record<string, never>) {
    const places = new Map((await this.places.find({}).toArray()).map((p) => [p._id, p.name]));
    const rows = await this.links.find({}).toArray();
    return rows
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        link: l._id,
        sourceName: places.get(l.source) ?? "?",
        destinationName: places.get(l.destination) ?? "?",
        forward: l.forward,
        accessible: l.accessible,
        blocked: l.blocked,
        closedFrom: l.closedFrom ?? 0,
        closedUntil: l.closedUntil ?? 0,
        service: l.service ?? "",
      }));
  }

  async _place({ place }: { place: string }) {
    const found = await this.places.findOne({ _id: place });
    return found ? [{ name: found.name, kind: found.kind, floor: found.floor, latitude: found.latitude ?? 0, longitude: found.longitude ?? 0 }] : [];
  }

  async _nearest({ latitude, longitude }: { latitude: number; longitude: number }) {
    if (!(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)) return [];
    const rows = (await this.places.find({ kind: "ENTRANCE" }).toArray())
      .filter((p) => p.latitude || p.longitude)
      .sort((a, b) => a.order - b.order);
    let best: PlaceDoc | undefined;
    let bestMeters = Infinity;
    for (const p of rows) {
      const meters = groundMeters(latitude, longitude, p.latitude, p.longitude);
      if (meters < bestMeters) [best, bestMeters] = [p, meters]; // strict, so the earliest added wins a tie
    }
    return best ? [{ place: best._id, name: best.name, latitude: best.latitude, longitude: best.longitude }] : [];
  }

  async _search({ text }: { text: string }) {
    const q = text.trim().toLowerCase();
    // ponytail: scans every place per keystroke (~10k, a few ms); a text index if the map grows much larger.
    const rows = await this.places.find({}).toArray();
    return rows
      .filter((p) => p.kind !== "TRANSIT" && p.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.kind === "ENTRANCE") - Number(a.kind === "ENTRANCE") || byName(a.name, b.name))
      .slice(0, SEARCH_LIMIT)
      .map(({ _id, name, kind, floor, latitude, longitude }) => ({ place: _id, name, kind, floor, latitude: latitude ?? 0, longitude: longitude ?? 0 }));
  }

  async _closest({ source, text, accessibleOnly, hour }: { source: string; text: string; accessibleOnly: boolean; hour: number }) {
    const places = new Map((await this.places.find({}).toArray()).map((p) => [p._id, p]));
    if (!places.has(source)) return [];
    const q = text.trim().toLowerCase();
    const matches = (id: string) => {
      const p = places.get(id)!;
      return id !== source && p.kind !== "TRANSIT" && p.name.toLowerCase().includes(q);
    };
    const links = (await this.links.find({}).toArray()).sort((a, b) => a.order - b.order);
    let found = 0;
    // Settled order is cheapest first, so the search can stop at the fifth match.
    const { dist, settled } = cheapest(links, source, accessibleOnly, hour, (id) => matches(id) && ++found >= CLOSEST);
    return settled
      .filter(matches)
      .slice(0, CLOSEST)
      .map((id) => ({ place: id, name: places.get(id)!.name, floor: places.get(id)!.floor, cost: dist.get(id)! }));
  }

  async _link({ link }: { link: string }) {
    const l = await this.links.findOne({ _id: link });
    return l ? [await describe(this.places, l)] : [];
  }

  async _blocked(_input: Record<string, never>) {
    const rows = (await this.links.find({ blocked: true }).toArray()).sort((a, b) => a.order - b.order);
    return Promise.all(rows.map(async (l) => ({ link: l._id, ...(await describe(this.places, l)) })));
  }

  async _sameService({ link }: { link: string }) {
    const existing = await this.links.findOne({ _id: link });
    if (!existing?.service) return [];
    const rows = await this.links.find({ service: existing.service }).toArray();
    return rows
      .filter((l) => l._id !== link)
      .sort((a, b) => a.order - b.order)
      .map((l) => ({ other: l._id }));
  }

  async _route({
    source,
    destination,
    accessibleOnly,
    hour,
  }: {
    source: string;
    destination: string;
    accessibleOnly: boolean;
    hour: number;
  }) {
    const places = new Map((await this.places.find({}).toArray()).map((p) => [p._id, p]));
    if (!places.has(source) || !places.has(destination) || source === destination) return [];
    const links = (await this.links.find({}).toArray()).sort((a, b) => a.order - b.order);

    const { came } = cheapest(links, source, accessibleOnly, hour, (place) => place === destination);
    if (!came.has(destination)) return [];

    const path: { link: LinkDoc; instruction: string; place: PlaceDoc }[] = [];
    for (let at = destination; at !== source; ) {
      const step = came.get(at)!;
      path.unshift({ link: step.link, instruction: step.instruction, place: places.get(at)! });
      at = step.from;
    }
    return path.map(({ link, instruction, place }, index) => ({
      step: index + 1,
      link: link._id,
      instruction,
      placeName: place.name,
      kind: place.kind,
      floor: place.floor,
      distance: link.distance ?? 1,
      latitude: place.latitude ?? 0,
      longitude: place.longitude ?? 0,
    }));
  }
}

## Exact starting paths

**.sync-engine/work/plan-accuracy/starting-paths.md**

# Starting paths

- scripts/seed.ts
- scripts/campus-to-map.ts
- scripts/fit-drawings.py
- src/compositions/Campus.ts
- src/compositions/Saved.ts
- src/compositions/inputs.ts
- src/concepts/Journaling.ts
- web/app.ts
- web/server.ts
- tests/

# Result

Unless the task requests another format, return these headings in order. Omit progress narration.

- `## Status` — required. First line is exactly `Complete` or `Blocked`; explanation goes below.
- `## Changed` — required. Paths changed, or none.
- `## Checks` — required. Exact command and pass/fail outcome.
- `## Blockers` — required. Categorize as design, context, or environment.
- `## Concerns` — optional. Material non-blocking uncertainty only.
