# Role and objective

Work unit `accounts`; role `designer`; phase `contracts`.

# Contract designer

Author the complete affected concept and application contract set needed by the work item. A supplied decomposition fixes boundaries, placement, and obligation IDs; otherwise use the brief and approved contracts. Preserve unaffected and catalog-unchanged surfaces.

Apply the supplied authored-format, SSF, boundary, and contract guidance exactly. Put mechanism state and invariants in concept contracts. Author application contracts for every required endpoint, link, and cross-concept behavior; include selected executable identities, cross-concept policy, acknowledgement order, and recovery. Cover action success, refusal state, repetition, lifecycle, query cardinality/order, authorization, and every affected obligation.

Edit design only. Run `bunx --no-install sync-engine check-design <changed files>` and repair its diagnostics before returning. Do not run generation or the full project check: source agreement cannot pass until implementation exists, and it is not contract syntax. Ask one focused question for a missing product choice; report a blocker when required behavior would change accepted boundaries or obligations.

# Access

Root: "/Users/riceelijah/dev/classes/6104/simmons-nav". The short native message explicitly authorizes reading this prompt file; all assignment context is inline below. This is already a compiled role assignment: do not load a skill, workflow, harness guide, or another instruction file.

- Read: none.
- Write: `assigned-design:compositions/Accounts.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/compositions/Accounts.md"), `assigned-design:compositions/Campus.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/compositions/Campus.md"), `assigned-design:compositions/Commons.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/compositions/Commons.md"), `assigned-design:compositions/Passwords.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/compositions/Passwords.md"), `assigned-design:compositions/Saved.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/compositions/Saved.md"), `assigned-design:concepts/Authenticating.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Authenticating.md"), `assigned-design:concepts/Favoriting.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Favoriting.md"), `assigned-design:concepts/Federating.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Federating.md"), `assigned-design:concepts/Journaling.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Journaling.md"), `assigned-design:concepts/Planning.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Planning.md"), `assigned-design:concepts/Preferring.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Preferring.md"), `assigned-design:concepts/Registering.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Registering.md"), `assigned-design:concepts/Reporting.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Reporting.md"), `assigned-design:concepts/Sessioning.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Sessioning.md"), `assigned-design:concepts/Wayfinding.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/concepts/Wayfinding.md"), `assigned-design:types.md` ("/Users/riceelijah/dev/classes/6104/simmons-nav/design/types.md").
- Tools: `repository-read`, `repository-write`.
- Shell: `project-validation`; network: no; generated output: no; long-running processes: no.

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

# Authored formats

Write each concept to `design/concepts/<Gerund>.md`, each application composition to `design/compositions/<Name>.md`, and application-owned concrete types to `design/types.md`. These are the only authored-design locations; decomposition remains the work-unit `decomposition.md`.

Each concept has one gerund identifier H1 naming its mechanism and these H2s, in order;
no other headings or fences:

````text
# Tasking

## Purpose
Unfenced prose.

## Principle
Unfenced prose.

## Types
```types
external Owner
  Optional explanation.
```

## State
```state
<SSF declarations>
```

## Actions
```actions
create (owner: Owner, title: String, dueAt?: DateTime) : returns (item: Item)
  where title is invalid
  then
    refuses INVALID_TITLE "A valid title is required."
  where title is valid
  then
    create the item
    returns item

delete (item: Item) : returns ()
  where true
  then
    delete the item
    returns
```

## Queries
```queries
_items (owner: Owner) : many (item: Item, title: String)
  answers the owner's items with their titles
  answers no rows when the owner has none
  orders rows by Item identity
```
````

A concept's Types section contains `external Name`, `opaque Name`, and
`Name is VALUE or VALUE` declarations, or is empty. State uses supplied SSF; keep every
State line inside its fence and prefix every invariant prose line with exact `Rule:`.
Actions use `name: Type`, optional `name?: Type`, `: returns`, parenthesized named results,
and one or more `where`/`then` branches. Indent `where` and `then` equally and each branch
body deeper. Terminal success `returns` exactly the declared names. Declare an empty result
`: returns ()` and end its branches with bare `returns`. Refuse with
`refuses CODE "Normative sentence."`; keep codes unique within an action and never shared
across actions. A returned name is a declared parameter, the row the branch created or
changed, or a value an earlier line in that branch binds, as in
`count the Tallies with subject as total`. Order an action's branches with its refusals
first and its terminal success last, and give each branch a condition the others cannot
also match.

Actions start with a letter; queries start `_` and use `one`, `optional`, or `many`
before the named row. Mark optional State values in the row `field?: Type`. A `one` body
always promises one row; only `optional` may say no row. Write a query body as one line
per fact: what it answers, then the empty or unknown case, then—for `many` alone—its
stable ordering.

```types
concrete Person
  Stable application identity.
```

```instances
instantiate Tasking with
  Owner is Person
instantiate Noting as Notes with
  Task is Tasking.Task
```

Bare `instantiate D` means `instantiate D as D`, for a definition with no external to
bind. Bind every external inline on its own instance, as above.

Concept files carry no application links, endpoint entries, instances, bindings, or
computations.

## Application files

Inventory exact selected static instances in `design/types.md`, whose `concrete`
declarations are application-owned; never declare core-owned `RequestBoundary`. A
definition may have zero or more instances, none carrying its name. Write an alias only as
`alias Alias for Target`, and leave no concrete unused; config checking rejects the rest.
Bindings convey identity only.

Put exact `reaction:`, `view:`, `former:`, and `computation:` links beside prose, never
wildcards. Every selected endpoint is a reaction declaration and therefore needs its own
`reaction:` link, in addition to links for internal reaction trees. It also needs exactly
one boundary declaration in an `endpoints` fence. Cover every selected endpoint, internal
reaction, named view, and former; declare each executable computation once. A composition
document reads as prose carrying its links and endpoint declarations:

````text
Submitting a response [enters the application](reaction:Circle.Reading.AddResponse).

```endpoints
Circle.Reading.AddResponse at /circle/respond
```

Choosing a reading [opens a discussion](reaction:Circle.Reading.SelectedOpensDiscussion)
about it. A circle page shows the circle, its members and that discussion
[as one record](former:Circle.Pages.CirclePage), and only a member
[may respond](view:Circle.Reading.MemberMayRespond).
````

Give each composition document a nonempty H1 and decision prose. An `endpoints` fence
contains declarations only, one per line in exact `Declaration.Identity at /path` form.
The identity is the same module, group, and declaration selected by the endpoint's
`reaction:` link. The portable absolute path is the exact path implementation passes to
`endpoint(...)`. Different endpoint identities may share a path only when they are
intentional alternatives.

Declare each computation once as `name(inputs) : Result`, no space before its inputs, with
an indented body where it is used, or in `design/types.md` when shared, and reference it as
`[normalization](computation:normalizeTitle)`. Its result is one bare type; a list or record
read from concept state is not a computation result:

```computations
normalizeTitle(raw: String) : String
  Produces the canonical task title used by endpoint adaptation.
```

The endpoint entry fixes the executable endpoint pathname; its `reaction:` link separately
fixes trace identity. Neither prescribes trigger syntax, stage structure, or variable
flow. If either declaration is absent, implementation must not create that endpoint. Do
not add an internal reaction link for a consequence the endpoint-linked declaration may
perform unless separate deferred behavior is an intentional design decision.

An application document does not duplicate endpoint input, return, or refusal listings:
the concept specifications and composition prose own that behavior, and a second copy
drifts from the contracts the checker reads. Transport methods, status codes, headers, and
external route projections remain outside the `endpoints` fence.

`check-design` proves grammar and authored form only. Config checking proves shapes,
bindings, links, endpoint identity/path agreement, computations, and source agreement. Neither proves boundaries, prose truth,
persistence, transactions, authorization, repair, or behavior; review and test.

---

# Simple State Form (SSF)

```text
document := (setDecl|subsetDecl|aliasDecl|ruleLine)*
setDecl := (a|an) [(set|seq) [of]] Type [with] declarationBody?
subsetDecl := (a|an) [set [of]] Qualifier+ Type [condition] [with] declarationBody?
condition := where fieldName is VALUE (or VALUE)*
declarationBody := (INDENT (field|uniqueLine|ruleLine))+
aliasDecl := alias Alias for Type
field := [a|an] modifier* [fieldName] (named|collection)
modifier := optional|unique
uniqueLine := unique fieldName (and fieldName)*
named := Qualifier* Type|Parameter|Local|primitive
collection := (set|seq) [of] named
primitive := Number|String|Flag|Date|DateTime
ruleLine := Rule: TEXT

typesLine := (external Name|opaque Name|Name is VALUE (or VALUE)+) [INDENT TEXT]
```

Start Type, Qualifier, Alias, Parameter, and Local uppercase ASCII and fieldName
lowercase; continue each with ASCII letters, digits, or `_`. Start VALUE uppercase and
continue with uppercase ASCII letters, digits, or `_` only. A field without a fieldName
is named for its type's words joined, with a lowercase first letter: `an Author` is
`author`, `a set of Tags` is `tags`, `a Verified User` is `verifiedUser`. Write names
when two fields share a type, and prefer a role name (`a sponsor Verified User`) when
the role matters.

Declare every type in the Types fence: `external Name` for an application-supplied
parameter, `Name is A or B` for an enumeration, `opaque Name` when the representation is
deliberately the implementer's. A name that is none of these, nor owned, nor primitive, nor
(in a State field) a declared subset, fails
with `SSF_UNDECLARED_TYPE`, in a State field or anywhere in an action or query signature,
including inside a type argument or union. Owned, external, concept-local, and primitive
names are one namespace. Never name a type for a primitive—write the primitive on the
field and state what narrows it where it is enforced.

Make every nonblank line parse or start with `Rule:`. Put a `Rule:` line at top level or
indented under a declaration; SSF keeps its TEXT verbatim and proves nothing. A top-level
rule ends the preceding declaration body. End a first line with `with` only when a field
or `unique` line follows, and always then; a `Rule:` line attaches without `with`.

A plain top-level set contains every individual of its type in the concept's state, and
each has its fields: with `a set of Users with a reputation Number`, every User any field
refers to is in `Users` and has a reputation. That holds whether the concept owns User or
takes it as `external User`; a set named for an external type's plural holds its
individuals and introduces no identity. Write the plural—`a set of User` collides with
the external name. The actions carry the obligation: storing a User makes it a member
with its fields, and removing a member removes or refuses every reference to it. Taking a
member out of a subset likewise removes or refuses every field of that subset's type that
holds it; type the field by the parent when it should outlive membership.

Declare a subset by qualifying its parent: `a set of Verified Users`, `a set of Trusted
Verified Users`, `a Root Folder`. One capitalized type word is a top-level set, sequence,
or singleton; more are a subset of the set the remaining words name, which must be declared unless it is an external type's plural (`a set of Read Posts` beside `external
Post` needs no `a set of Posts`). The name is the whole phrase, `Verified Users` or `Verified User`, never the
qualifier alone. Use a qualified subset instead of a plain set, or instead of `optional`
fields, when only some individuals carry fields. A qualifier may qualify different sets
(`Pending Invitations`, `Pending Users`) but appears once among one set's subsets. Use a
subset as a State field type (`a sponsor Verified User`); in action and query signatures
take the parent type and state membership in a condition, such as `where sponsor is in
Verified Users`. Name the set for membership in any condition: `user is in Users`, not
`user exists`. Never write `a Verified set of Users` or `a verified set of Users`.

SSF accepts automatic singular/plural aliases for owned sets and sequences, and for
external types, when an authored State field, subset line, or action/query signature
supplies one unambiguous matching name; a subset phrase joins through its last word.
Declare an explicit `alias` for a synonym or an ambiguous singular/plural relationship of
an owned set; the explicit declaration takes precedence. An external type cannot be an
alias target, so when a spelling pairs with several external types, write the exact
external name or rename one of them.

An alias targets one unique owned top-level declaration: a set, sequence, or singleton. It
cannot target another alias, a subset, an external or a set of one, an opaque or enum type,
a primitive, a duplicate, or an unresolved name. Automatic singular/plural joins never
reach singletons; only an explicit alias names one. Alias collisions and chains, ambiguous automatic
relationships, duplicate subsets, repeated qualifiers, and undeclared parents are
rejected.

Structures, aliases, externals, local types, and primitives share one type universe, and
a subset's joined identifier (`VerifiedUsers`, `VerifiedUser`) may not collide with it. A
field cannot be named `optional`, `unique`, `set`, or `seq`. Keep fieldNames unique per
declaration and VALUEs per enum. Every State type must resolve to an owned, external,
subset, local, or primitive type, and every signature type to one that is not a subset.

Mark a field `unique` when its values must be unique among members of that declaration; a
unique collection field compares the whole collection. A `unique` line names the fields of
one constraint; the modifier is shorthand for a line naming that field alone, so use the
line where the field is inherited rather than declared. Order does not distinguish a
combination; a declaration may carry several. A subset's constraints bind only its own
members and may name ancestor fields. Condition a subset on a field whose type is a
declared enumeration to state which members it classifies. Write each modifier
at most once, in either order, between any article and the fieldName; `a` and `an` both
read. Case separates the forms: `unique Email` is a unique field named `email`, and
`unique email` a constraint line; `a Verified User` holds a Verified User, while `a
verified User` is a field named `verified` holding any User. Collections are never `optional` (empty means absent)
or nested; named-type unions are invalid. Owned sets and sequences introduce
identities—never add ID fields. Subsets add no identity; they classify parent members,
may overlap, and add relations. `a Type` or `an Type` has one member. Either article is
accepted; indentation distinguishes a declaration from an implicitly named field.
Which side declares a relation implies no storage, navigation, or ownership.

```state
a set of Items with
  a unique title String
  an item Item
  an optional owner Person
  a watchers set of Person
  an updates seq of Update
  a Status

a set of Votes with
  an Item
  a Voter
  unique item and voter

a set of Completed Items where status is DONE with
  a completedAt DateTime

a set of Reviews with
  a Completed Item
  a reviewer Person

a set of Muted People

a Settings with
  a retentionDays Number

alias WorkItem for Items

Rule: an Item's owner must be active
```

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

## Task

**.sync-engine/work/accounts/tasks/designer.md**

Author the design for the brief: copy ConceptBox's Registering, Authenticating, Sessioning, Federating specs and its accounts/passwords/commons composition docs (flattened into modules Accounts, Passwords, Commons); add concepts Favoriting, Planning, Journaling, Preferring; extend types.md instances; extend Campus.md for session-guarded flag/clear, reporter usernames, and a new composition doc Saved.md for favorites/trips/preferences/history endpoints; add `distance` to Wayfinding `_route` outputs. Check design syntax.

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

# Result

Unless the task requests another format, return these headings in order. Omit progress narration.

- `## Status` — required. First line is exactly `Complete` or `Blocked`; explanation goes below.
- `## Changed` — required. Paths changed, or none.
- `## Questions` — required. Material questions, or none.
- `## Checks` — optional. Command and outcome when applicable.
