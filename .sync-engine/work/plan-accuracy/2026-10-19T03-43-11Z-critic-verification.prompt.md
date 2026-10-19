# Role and objective

Work unit `plan-accuracy`; role `critic`; phase `verification`.

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

**.sync-engine/work/plan-accuracy/tasks/critic-verify.md**

Verify that the repaired design (Campus.md, Saved.md, Journaling.md) resolves F1–F6 of the original findings without new problems. design/types.md is supplied for F4.

## Brief

**.sync-engine/work/plan-accuracy/brief.md**

Unchanged from the prior same-agent context.

## Original finding or routed blocker IDs

**.sync-engine/work/plan-accuracy/2026-10-19T03-40-19Z-critic-contracts.response.md**

## Verdict
Revise

The changed set has the application contracts the brief needs (the Campus and Saved compositions, with their endpoints and links). The blocker is something else: Campus.md now says the seed removes places and connections that drop out of the map. That contradicts Saved.md, and it can leave open reports that nothing can resolve. See F1 and F2.

## Assessments

| Obligation | Trigger | Closing reaction / owner | Visible success | False interval | Ack order | Retry identity / owner accepts | Recovery | Dup-effect risk |
|---|---|---|---|---|---|---|---|---|
| FindRoute input checks | route request | FindRoute → Routing.Route (query only) | numbered steps or empty list | none | validate → query → answer | n/a (no effect) | resend | none |
| FindClosest input checks | closest request | FindClosest → Routing.Closest | ≤5 places by cost, or empty | none | validate → query → answer | n/a | resend | none |
| NearestPlace | lat/lng request | NearestPlace → Routing.Nearest | optional entrance | none | validate → query → answer | n/a | resend | none |
| BlockLink | signed-in flag | Wayfinding block then Reporting record | report | blocked without a report if recording fails (stated) | block → report → answer | none; a retry is refused ALREADY_BLOCKED | unblock, then flag again (stated) | none (second report refused) |
| UnblockLink + UnblockResolvesReports + ClearingResolvesSharedReports | signed-in clear | Wayfinding unblock; Reporting resolves | connection | reports open after clear (deferred reaction) | unblock → answer; resolve reactions not ordered before answer | connection id; owner refuses NOT_BLOCKED on repeat | none if the resolve reaction is lost (unchanged contract) | low |
| Seed update in place (new) | operator runs seed | **no declared owner action** (writes "straight into Wayfinding's state") | none (offline) | mixed old/new map if a run stops partway | n/a | place name; connection = (two places, directions); no owner action is declared to check them | re-run (implied) | identity churn when directions change (F2) |
| SaveTrip input checks | save request | Planning save after Wayfinding._place check | trip | none | validate → place check → save → answer | none; a retry is refused TRIP_NAME_TAKEN | resend | none |
| FinishTrip / Journaling.finish 0–100 km | end of route | Journaling.finish | entry | none | validate → place check → finish → answer | none; a duplicate entry is accepted (stated) | resend | accepted duplicate (stated beta trade-off) |
| MIT-drawing layer | local script + frontend | outside the application (no endpoint, no concept) | toggle only when the file exists | n/a | n/a | n/a | n/a | n/a |

Inventory of endpoints and paths: ShowOverview /map/overview, SearchPlaces /map/search, FindRoute /route/find, FindClosest /route/closest, NearestPlace /route/nearest, BlockLink /problems/block, UnblockLink /problems/unblock, ShowMine /me, Favorite /me/favorites/add, Unfavorite /me/favorites/remove, SaveTrip /me/trips/save, RemoveTrip /me/trips/remove, SetPreferences /me/preferences/set, FinishTrip /me/trips/finish. The Setup endpoints are gone, which matches the brief, and nothing in the set still links to them.

- **Internal reactions:** UnblockResolvesReports and ClearingResolvesSharedReports.
- **Formers:** PlaceSearch, ProblemList, BlockedList, Route, Closest, Nearest, MyFavorites, MyTrips, MyPreferences, MyHistory, MyTotals.
- **Not verifiable:** computations and typed links, because `design/types.md` and the Wayfinding, Reporting and Planning contracts were not supplied (see F4).

The Journaling action is correct. Its two `where` clauses split the number line completely for finite values (JSON cannot carry NaN), a refusal changes nothing, and repetition is spelled out. The `_history` and `_totals` cardinality, ordering and empty cases are all stated.

## Findings

**F1 (blocker): place removal contradicts Saved and breaks the saved-things listings.**
- Campus.md: "places and connections no longer in the map are removed."
- Saved.md still says "places are never removed, every one of them is listed."
- After a regeneration that renames or drops a place, the favorites, trips and journal entries that refer to it point at a place `Wayfinding._place` no longer knows.
- No contract says how MyFavorites, MyTrips or MyHistory behave then (drop the row, list it without a name, or fail). It is also unclear whether the person can still remove such a favorite or trip, since Unfavorite's NO_SUCH_PLACE check order and RemoveTrip are unaffected but untested here.
- The brief requires that favorites, trips and history survive a map update. Identity by unchanged name only partly delivers that.

**F2 (blocker): open reports on a removed connection can never be resolved.**
- The seed keeps a connection's identity only when its two places and its directions are unchanged. Directions carry metres ("Walk about 30 m…"), so any change in measured distance makes a new connection and removes the old one.
- If the old connection was blocked, its block is lost and its open report is left behind.
- ProblemList shows each report with "its connection's two places and its directions" and promises "an open problem is never hidden". Neither can hold once the connection is gone.
- Reports are resolved only by reaction to UnblockLink, and UnblockLink refuses an unknown connection with NO_SUCH_LINK. No available action resolves such a report, so this required work cannot be recovered.
- The same gap applies to elevator service sharing: when the seed adds a ride to an elevator that is out, nothing says whether the new ride starts blocked.

**F3 (material): the seed mutates Wayfinding with no declared owner action.**
- "Writes … straight into Wayfinding's state" names the effect but no Wayfinding action that owns it.
- The rules that action would carry are race- and invariant-sensitive: upsert keyed by name, matching connections on (places, directions), keeping or dropping blocked status, removing what is gone, shared-service consistency.
- With the Setup endpoints removed, the design does not say which Wayfinding actions, if any, the seed uses, so these rules have no enforcing owner.
- The Wayfinding contract was not supplied, so I could not check whether it already declares such actions.
- The seed's failure behaviour is also unstated: a partial run leaves a mixed map, and only an implied re-run repairs it.

**F4 (material, cannot verify): the new input checks imply computations I could not see.**
- The prose now implies pure checks: text or boolean or number type checks, hour in 0–24, and metres being a number, for FindRoute, FindClosest, NearestPlace, SaveTrip and FinishTrip.
- Each should be a declared computation (or covered by declared boundary types) with an exact typed link and a matching endpoint entry in `design/types.md`.
- `design/types.md` was not supplied, so I cannot confirm these declarations exist, or that none of them reads concept state.
- Please supply it (and the Wayfinding, Reporting and Planning contracts) before approval.

**F5 (material): the "invalid request" refusal has no stable code.**
- FindRoute, FindClosest, NearestPlace, SaveTrip, SetPreferences and FinishTrip all refuse "as an invalid request".
- No stable refusal code or meaning is given, unlike every other refusal in the set (NOT_SIGNED_IN, NO_SUCH_PLACE, INVALID_DISTANCE and so on).
- The boundary guidance requires every refusal to carry a stable code.

**F6 (material): the order of refusals in FinishTrip is unspecified.**
- One request can fail several checks at once: an unknown place with a negative distance, or a non-number with an unknown place.
- The composition lists the refusals but not which wins.
- Saved.md does state that NO_SUCH_PLACE comes "before anything is kept", so the effect side is safe. Only the visible refusal is ambiguous.

## Revised candidate context

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

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because a passage can be closed at some hours of the day; the generated campus map has no closing hours yet, so today every hour gives the same route. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps, each carrying the connection it uses, which is where a visitor starts when flagging a passage; when either place is unknown or no route exists, the answer is an empty list rather than a refusal. The places must be text, the step-free flag true or false, and the hour a number from 0 to 24; anything else is refused with INVALID_REQUEST.

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

The map itself is not editable over the API: there are no endpoints for adding places or connections, so a visitor cannot change it. A seed script, run by whoever deploys the app, fills it. The script is an operator tool outside the application, like a database migration: it writes the campus map generated from MIT's room inventory, MapIT's room positions, and OpenStreetMap's buildings, entrances and paths straight into Wayfinding's state by the rules below, and running it again with the same map changes nothing, so a run that stops partway is repaired by running it again. Running it after the map is regenerated updates the map in place rather than starting over. A place whose name is unchanged keeps its identity, with its kind, floor and position updated, so favorites, saved trips and history that refer to it keep working. A connection keeps its identity when it joins the same two places in the same direction with the same directions apart from their metres ("Walk about 30 m to stairway SA" and "Walk about 32 m to stairway SA" are the same connection), with its other details updated and whether it is blocked kept; a new connection that shares a service with a blocked one starts blocked, since that elevator is still out. Places and connections no longer in the map are removed, and the script resolves every open report on a connection it removes, since that passage is gone. Accounts, sessions, saved things, preferences and every other report are left alone.

**design/compositions/Saved.md**

# Saved things

A signed-in person keeps their own favorites, saved trips, preferences and trip journal. Every endpoint here starts with `Sessioning.use`, which returns the person or refuses with NOT_SIGNED_IN, and acts on that person only: nobody can read or change another person's things, because no endpoint takes a person as an input.

The [my-things request](reaction:Saved.Mine.ShowMine) carries the session and answers with everything the person has kept: [their favorites](former:Saved.Mine.MyFavorites), each with the place's name, kind and floor from `Wayfinding._place`, newest first; [their saved trips](former:Saved.Mine.MyTrips), each with the names of its two places; [their preferences](former:Saved.Mine.MyPreferences); [their recent trips](former:Saved.Mine.MyHistory), newest first, with place names; and [their totals](former:Saved.Mine.MyTotals), the number of finished trips and the estimated metres. Favorites, trips and journal entries are only ever kept for places on the map, but a place can leave the map when it is regenerated (see [the campus map](Campus.md)); a favorite, trip or entry whose place is gone is no longer listed, while the totals still count every entry. Removing such a favorite or trip still works, since neither removal checks the place.

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

## Retained review guidance

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

# Result

Unless the task requests another format, return these headings in order. Omit progress narration.

- `## Verdict` — required. First line is exactly `Approve`, `Revise`, or `Blocked`.
- `## Findings` — required. Stable findings or routed blockers resolved/unresolved; direct regressions or none.
