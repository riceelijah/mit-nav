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
- Designer simulated; critic (fresh Claude Code agent) Revise M-01..M-07 → repaired → Approve. Implementation simulated; 51 tests pass; browser checks pass; Commons live flow untested.
