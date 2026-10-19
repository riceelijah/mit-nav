# Role and objective

Continue work unit `frontend-redesign`; role `critic`; phase `verification`. The prior same-phase role contract remains authoritative.

# Access

This grant replaces prior access; other rules remain.

Current grant:

```json
{"readableAreas":[],"writableAreas":[],"toolKinds":[],"projectShell":"none","network":false,"generatedOutput":false,"longRunningProcesses":false}
```

# Guidance

Unchanged from the prior same-agent context. Apply it to the task and changed context below.

# Context

## Verification task

**.sync-engine/work/frontend-redesign/tasks/critic-verify2.md**

Verify N1-a, N1-b, N1-c.

## Brief

**.sync-engine/work/frontend-redesign/brief.md**

Unchanged from the prior same-agent context.

## Original finding or routed blocker IDs

**.sync-engine/work/frontend-redesign/2026-10-19T02-58-24Z-critic-verification.response.md**

## Verdict
Revise

M1, M2, M3 fixed; no regressions. N-1 nearest-of-a-kind sound; three gaps in the units preference.

## Findings
- **M1, M2, M3: Resolved.**
- **N-1 sound:** `_closest`, FindClosest at /route/closest, journal entries in metres.
- **N1-a:** SetPreferences names no refusal for a missing or unknown units value.
- **N1-b:** `_preferences` doesn't say what preferences saved before units existed answer.
- **N1-c:** walking-minutes conversion rate is not stated in the design.

## Revised candidate context

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

## Retained review guidance

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/boundary.md**

Unchanged from the prior same-agent context.

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/contracts.md**

Unchanged from the prior same-agent context.

**../../../../../../private/var/folders/nh/2rss2pjn1y7fwmc7wgkyn8sr0000gn/T/bunx-501-@mit-sdg/sync-engine-skill@1.1.0/node_modules/@mit-sdg/sync-engine-skill/skills/sync-engine/prompts/guidance/design/ssf-reading.md**

Unchanged from the prior same-agent context.

# Result

Unless the task requests another format, use these prior fields: `## Verdict`, `## Findings`.
