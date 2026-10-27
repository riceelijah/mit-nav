<!-- Generated from the MIT Campus Navigation assembly. Do not edit. -->
<!-- Manifest producer: @mit-sdg/sync-engine@1.1.0; concept specification: sync-engine.concept-specification@1; renderer: @mit-sdg/sync-engine@1.1.0. -->

# MIT Campus Navigation — assembled read-back

_Assembled by sync-engine from registered concepts and composition. Edit the concept_
_specifications and composition source, then regenerate this file._

## Concepts

### Authenticating

Defined in [Authenticating](../design/concepts/Authenticating.md), line 1.

#### Actions

- `set(user: User, password: String) : returns (user: User)`
  - Refuses `INVALID_PASSWORD`: A password must have 8 to 128 characters.
  - Refuses `PASSWORD_SET`: This account already has a password.
- `authenticate(user: User, password: String) : returns (user: User)`
  - Refuses `INVALID_CREDENTIALS`: The username or password is incorrect.

#### Queries

- `_acceptable(password: String) : one (acceptable: Flag)`

#### Instances

- `Authenticating` — instance of `Authenticating` — [Application types](../design/types.md), line 12.
  - `User` is `Registering.User` — [Application types](../design/types.md), line 13.

### Favoriting

Defined in [Favoriting](../design/concepts/Favoriting.md), line 1.

#### Actions

- `favorite(user: User, item: Item) : returns ()`
  - Refuses `ALREADY_FAVORITE`: That is already a favorite.
- `unfavorite(user: User, item: Item) : returns ()`
  - Refuses `NOT_FAVORITE`: That is not a favorite.

#### Queries

- `_favorites(user: User) : many (item: Item)`

#### Instances

- `Favoriting` — instance of `Favoriting` — [Application types](../design/types.md), line 25.
  - `Item` is `Wayfinding.Place` — [Application types](../design/types.md), line 27.
  - `User` is `Registering.User` — [Application types](../design/types.md), line 26.

### Federating

Defined in [Federating](../design/concepts/Federating.md), line 1.

#### Actions

- `start() : returns (attempt: Attempt, expiresAt: DateTime, address: String)`
- `finish(attempt: Attempt, nonce: String, code: String) : returns (username: String)`
  - Refuses `SIGN_IN_EXPIRED`: This sign-in has expired. Start again.
  - Refuses `SIGN_IN_REFUSED`: The other site didn't confirm this sign-in. Start again.
- `link(attempt: Attempt, user: User) : returns (user: User)`
  - Refuses `NOT_CONFIRMED`: This sign-in hasn't been confirmed.
  - Refuses `ALREADY_LINKED`: This account on the other site is already linked.

#### Queries

- `_user(attempt: Attempt) : optional (user: User)`
- `_linkable(attempt: Attempt) : one (linkable: Flag)`
- `_linked(user: User) : one (linked: Flag)`

#### Instances

- `CommonsFederating` — instance of `Federating` — [Application types](../design/types.md), line 15.
  - `User` is `Registering.User` — [Application types](../design/types.md), line 16.

### Journaling

Defined in [Journaling](../design/concepts/Journaling.md), line 1.

#### Actions

- `finish(traveller: User, source: Place, destination: Place, meters: Number) : returns (entry: Entry)`
  - Refuses `INVALID_DISTANCE`: A trip is between 0 and 100 km.

#### Queries

- `_history(traveller: User) : many (entry: Entry, source: Place, destination: Place, meters: Number)`
- `_totals(traveller: User) : one (trips: Number, meters: Number)`

#### Instances

- `Journaling` — instance of `Journaling` — [Application types](../design/types.md), line 33.
  - `Place` is `Wayfinding.Place` — [Application types](../design/types.md), line 35.
  - `User` is `Registering.User` — [Application types](../design/types.md), line 34.

### Planning

Defined in [Planning](../design/concepts/Planning.md), line 1.

#### Actions

- `save(owner: User, name: String, source: Place, destination: Place, accessibleOnly: Flag) : returns (trip: Trip)`
  - Refuses `TRIP_NAME_TAKEN`: You already have a trip with that name.
  - Refuses `EMPTY_TRIP_NAME`: A trip needs a name.
- `remove(owner: User, trip: Trip) : returns ()`
  - Refuses `NO_SUCH_TRIP`: You have no such trip.

#### Queries

- `_trips(owner: User) : many (trip: Trip, name: String, source: Place, destination: Place, accessibleOnly: Flag)`

#### Instances

- `Planning` — instance of `Planning` — [Application types](../design/types.md), line 29.
  - `Place` is `Wayfinding.Place` — [Application types](../design/types.md), line 31.
  - `User` is `Registering.User` — [Application types](../design/types.md), line 30.

### Preferring

Defined in [Preferring](../design/concepts/Preferring.md), line 1.

#### Actions

- `set(user: User, stepFree: Flag, indoors: Flag, useLocation: Flag, units: Units) : returns ()`

#### Queries

- `_preferences(user: User) : one (stepFree: Flag, indoors: Flag, useLocation: Flag, units: Units)`

#### Instances

- `Preferring` — instance of `Preferring` — [Application types](../design/types.md), line 37.
  - `User` is `Registering.User` — [Application types](../design/types.md), line 38.

### Registering

Defined in [Registering](../design/concepts/Registering.md), line 1.

#### Actions

- `register(username: String) : returns (user: User)`
  - Refuses `INVALID_USERNAME`: A username must have 3 to 32 letters, digits, underscores, or hyphens.
  - Refuses `USERNAME_TAKEN`: That username is taken.

#### Queries

- `_byUsername(username: String) : optional (user: User)`
- `_username(user: User) : optional (username: String)`

#### Instances

- `Registering` — instance of `Registering` — [Application types](../design/types.md), line 10.

### Reporting

Defined in [Reporting](../design/concepts/Reporting.md), line 1.

#### Actions

- `report(reporter: User, target: Target, reason: String) : returns (report: Report)`
- `resolve(target: Target) : returns ()`

#### Queries

- `_open() : many (report: Report, reporter: User, target: Target, reason: String)`
- `_about(target: Target) : many (report: Report, reporter: User, reason: String, status: Status)`

#### Instances

- `Reporting` — instance of `Reporting` — [Application types](../design/types.md), line 21.
  - `Target` is `Wayfinding.Link` — [Application types](../design/types.md), line 23.
  - `User` is `Registering.User` — [Application types](../design/types.md), line 22.

### Sessioning

Defined in [Sessioning](../design/concepts/Sessioning.md), line 1.

#### Actions

- `start(subject: Subject) : returns (session: Session, expiresAt: DateTime)`
- `use(session: Session) : returns (subject: Subject)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.
- `end(session: Session) : returns (session: Session)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.

#### Instances

- `Sessioning` — instance of `Sessioning` — [Application types](../design/types.md), line 18.
  - `Subject` is `Registering.User` — [Application types](../design/types.md), line 19.

### Wayfinding

Defined in [Wayfinding](../design/concepts/Wayfinding.md), line 1.

#### Actions

- `addPlace(name: String, kind: Kind, floor: Number, latitude: Number, longitude: Number) : returns (place: Place)`
  - Refuses `DUPLICATE_PLACE`: A place with that name already exists.
- `alias(place: Place, aliases: String) : returns (place: Place)`
  - Refuses `NO_SUCH_PLACE`: There is no such place.
- `connect(source: Place, destination: Place, forward: String, backward: String, accessible: Flag, outdoor: Flag, closedFrom: Number, closedUntil: Number, service: String, distance: Number, path: String, keyed: Flag) : returns (link: Link)`
  - Refuses `NO_SUCH_PLACE`: Both places must exist before they can be connected.
- `block(link: Link) : returns (link: Link)`
  - Refuses `NO_SUCH_LINK`: There is no such connection.
  - Refuses `ALREADY_BLOCKED`: That connection is already blocked.
- `unblock(link: Link) : returns (link: Link)`
  - Refuses `NO_SUCH_LINK`: There is no such connection.
  - Refuses `NOT_BLOCKED`: That connection is not blocked.

#### Queries

- `_places() : many (place: Place, name: String, kind: Kind, floor: Number)`
- `_links() : many (link: Link, sourceName: String, destinationName: String, forward: String, accessible: Flag, blocked: Flag, closedFrom: Number, closedUntil: Number, service: String)`
- `_place(place: Place) : optional (name: String, kind: Kind, floor: Number, latitude: Number, longitude: Number)`
- `_nearest(latitude: Number, longitude: Number) : optional (place: Place, name: String, latitude: Number, longitude: Number)`
- `_search(text: String) : many (place: Place, name: String, kind: Kind, floor: Number, latitude: Number, longitude: Number, aliases: String)`
- `_closest(source: Place, text: String, accessibleOnly: Flag, indoorsPreferred: Flag, hour: Number, keyless: Flag, day: Number) : many (place: Place, name: String, floor: Number, cost: Number)`
- `_link(link: Link) : optional (sourceName: String, destinationName: String, forward: String, service: String)`
- `_blocked() : many (link: Link, sourceName: String, destinationName: String, forward: String, service: String)`
- `_sameService(link: Link) : many (other: Link)`
- `_route(source: Place, destination: Place, accessibleOnly: Flag, indoorsPreferred: Flag, hour: Number, keyless: Flag, day: Number) : many (step: Number, link: Link, instruction: String, placeName: String, kind: Kind, floor: Number, distance: Number, latitude: Number, longitude: Number, path: String)`

#### Instances

- `Wayfinding` — instance of `Wayfinding` — [Application types](../design/types.md), line 8.

## Formers

_Formers name result shapes evaluated when asked. The source former owns_
_the authored explanation; this section records the generated shape._

### the blocked connections

Authored path: `Campus.Browsing.BlockedList`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 9.

```former
Former "the blocked connections" — inputs (); bindings (link, sourceName, destinationName, forward, service); promises exactly one record — forms:
  a record of
    links: each Wayfinding._blocked () has (destinationName, forward, link, service, sourceName)
      form a record of
        destinationName
        forward
        link
        service
        sourceName
```

### the building nearest (latitude, longitude)

Authored path: `Campus.Routing.Nearest`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 34.

```former
Former "the building nearest (latitude, longitude)" — inputs (latitude, longitude); bindings (place, name, placeLatitude, placeLongitude); promises exactly one record — forms:
  a record of
    places: each Wayfinding._nearest (latitude, longitude) has (latitude: placeLatitude, longitude: placeLongitude, name, place)
      form a record of
        latitude: placeLatitude
        longitude: placeLongitude
        name
        place
```

### the favorites of (user)

Authored path: `Saved.Mine.MyFavorites`.
- Covered by [Saved things](../design/compositions/Saved.md), line 5.

```former
Former "the favorites of (user)" — inputs (user); bindings (item, name, kind, floor); promises exactly one record — forms:
  a record of
    favorites: each Favoriting._favorites (user) has (item)
      where Wayfinding._place (place: item) has (floor, kind, name)
      form a record of
        floor
        kind
        name
        place: item
```

### the open problem reports

Authored path: `Campus.Browsing.ProblemList`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 9.

```former
Former "the open problem reports" — inputs (); bindings (report, reporter, reportedLink, reason, sourceName, destinationName, forward, username); promises exactly one record — forms:
  a record of
    reports: each Reporting._open () has (reason, report, reporter, target: reportedLink)
      where Wayfinding._link (link: reportedLink) has (destinationName, forward, sourceName)
      where whether Registering._username (user: reporter) has (username)
      form a record of
        destinationName
        forward
        link: reportedLink
        reason
        report
        reporter: username
        sourceName
```

### the places matching (text)

Authored path: `Campus.Browsing.PlaceSearch`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 9.

```former
Former "the places matching (text)" — inputs (text); bindings (place, name, kind, floor, latitude, longitude, aliases); promises exactly one record — forms:
  a record of
    places: each Wayfinding._search (text) has (aliases, floor, kind, latitude, longitude, name, place)
      form a record of
        aliases
        floor
        kind
        latitude
        longitude
        name
        place
```

### the places matching (text) nearest (source)

Authored path: `Campus.Routing.Closest`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 24.

```former
Former "the places matching (text) nearest (source)" — inputs (source, text, accessibleOnly, indoorsPreferred, hour, keyless, day); bindings (place, name, floor, cost); promises exactly one record — forms:
  a record of
    places: each Wayfinding._closest (accessibleOnly, day, hour, indoorsPreferred, keyless, source, text) has (cost, floor, name, place)
      form a record of
        cost
        floor
        name
        place
```

### the preferences of (user)

Authored path: `Saved.Mine.MyPreferences`.
- Covered by [Saved things](../design/compositions/Saved.md), line 5.

```former
Former "the preferences of (user)" — inputs (user); bindings (stepFree, indoors, useLocation, units); promises exactly one record — forms:
  a record of
    preferences: each Preferring._preferences (user) has (indoors, stepFree, units, useLocation)
      form a record of
        indoors
        stepFree
        units
        useLocation
```

### the recent trips of (user)

Authored path: `Saved.Mine.MyHistory`.
- Covered by [Saved things](../design/compositions/Saved.md), line 5.

```former
Former "the recent trips of (user)" — inputs (user); bindings (entry, source, destination, meters, sourceName, destinationName); promises exactly one record — forms:
  a record of
    history: each Journaling._history (traveller: user) has (destination, entry, meters, source)
      where Wayfinding._place (place: source) has (name: sourceName)
      where Wayfinding._place (place: destination) has (name: destinationName)
      form a record of
        destination
        destinationName
        entry
        meters
        source
        sourceName
```

### the route from (source) to (destination)

Authored path: `Campus.Routing.Route`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 18.

```former
Former "the route from (source) to (destination)" — inputs (source, destination, accessibleOnly, indoorsPreferred, hour, keyless, day); bindings (step, link, instruction, placeName, kind, floor, distance, latitude, longitude, path); promises exactly one record — forms:
  a record of
    steps: each Wayfinding._route (accessibleOnly, day, destination, hour, indoorsPreferred, keyless, source) has (distance, floor, instruction, kind, latitude, link, longitude, path, placeName, step)
      form a record of
        distance
        floor
        instruction
        kind
        latitude
        link
        longitude
        path
        placeName
        step
```

### the saved trips of (user)

Authored path: `Saved.Mine.MyTrips`.
- Covered by [Saved things](../design/compositions/Saved.md), line 5.

```former
Former "the saved trips of (user)" — inputs (user); bindings (trip, name, source, destination, accessibleOnly, sourceName, destinationName); promises exactly one record — forms:
  a record of
    trips: each Planning._trips (owner: user) has (accessibleOnly, destination, name, source, trip)
      where Wayfinding._place (place: source) has (name: sourceName)
      where Wayfinding._place (place: destination) has (name: destinationName)
      form a record of
        accessibleOnly
        destination
        destinationName
        name
        source
        sourceName
        trip
```

### the trip totals of (user)

Authored path: `Saved.Mine.MyTotals`.
- Covered by [Saved things](../design/compositions/Saved.md), line 5.

```former
Former "the trip totals of (user)" — inputs (user); bindings (trips, meters); promises exactly one record — forms:
  a record of
    totals: each Journaling._totals (traveller: user) has (meters, trips)
      form a record of
        meters
        trips
```

## Reactions

### Accounts.identifying.Me

Authored path: `Accounts.identifying.Me`.
- Covered by [Accounts](../design/compositions/Accounts.md), line 5.
- Covered by [Accounts](../design/compositions/Accounts.md), line 8.

```reaction
when RequestBoundary.request (path: "/auth/me", requestId, session)
then
  Sessioning.use (session)
```

### Accounts.identifying.Me#2

Authored path: `Accounts.identifying.Me`.
- Covered by [Accounts](../design/compositions/Accounts.md), line 5.
- Covered by [Accounts](../design/compositions/Accounts.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by Accounts.identifying.Me
where
  Registering._username (user) has (username)
  earlier, RequestBoundary.request (path: "/auth/me", requestId, session)
then
  RequestBoundary.respond (requestId, username)
```

### Accounts.leaving.SignOut

Authored path: `Accounts.leaving.SignOut`.
- Covered by [Accounts](../design/compositions/Accounts.md), line 11.
- Covered by [Accounts](../design/compositions/Accounts.md), line 14.

```reaction
when RequestBoundary.request (path: "/auth/logout", requestId, session)
then
  Sessioning.end (session)
```

### Accounts.leaving.SignOut#2

Authored path: `Accounts.leaving.SignOut`.
- Covered by [Accounts](../design/compositions/Accounts.md), line 11.
- Covered by [Accounts](../design/compositions/Accounts.md), line 14.

```reaction
when Sessioning.end (session), asked by Accounts.leaving.SignOut
where
  earlier, RequestBoundary.request (path: "/auth/logout", requestId, session)
then
  RequestBoundary.respond (requestId)
```

### Campus.Browsing.SearchPlaces

Authored path: `Campus.Browsing.SearchPlaces`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 9.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 15.

```reaction
when RequestBoundary.request (path: "/map/search", requestId, text)
then
  RequestBoundary.respond (places: former "the places matching (text)" with (text), requestId)
```

### Campus.Browsing.ShowOverview

Authored path: `Campus.Browsing.ShowOverview`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 9.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 14.

```reaction
when RequestBoundary.request (path: "/map/overview", requestId)
then
  RequestBoundary.respond (blocked: former "the blocked connections", problems: former "the open problem reports", requestId)
```

### Campus.Problems.BlockLink

Authored path: `Campus.Problems.BlockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 40.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 43.

```reaction
when RequestBoundary.request (link, path: "/problems/block", reason, requestId, session)
then
  Sessioning.use (session)
```

### Campus.Problems.BlockLink#2

Authored path: `Campus.Problems.BlockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 40.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 43.

```reaction
when Sessioning.use (session, subject: user), asked by Campus.Problems.BlockLink
where
  earlier, RequestBoundary.request (link, path: "/problems/block", reason, requestId, session)
then
  Wayfinding.block (link)
```

### Campus.Problems.BlockLink#3

Authored path: `Campus.Problems.BlockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 40.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 43.

```reaction
when Wayfinding.block (link), asked by Campus.Problems.BlockLink#2
where
  earlier, Sessioning.use (session, subject: user), asked by Campus.Problems.BlockLink
  earlier, RequestBoundary.request (link, path: "/problems/block", reason, requestId, session)
then
  Reporting.report (reason, reporter: user, target: link)
```

### Campus.Problems.BlockLink#4

Authored path: `Campus.Problems.BlockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 40.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 43.

```reaction
when Reporting.report (reason, reporter: user, target: link, report), asked by Campus.Problems.BlockLink#3
where
  earlier, RequestBoundary.request (link, path: "/problems/block", reason, requestId, session)
then
  RequestBoundary.respond (report, requestId)
```

### Campus.Problems.ClearingResolvesSharedReports

Authored path: `Campus.Problems.ClearingResolvesSharedReports`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 47.

```reaction
when Wayfinding.unblock (link)
where
  Wayfinding._sameService (link) has (other)
then
  Reporting.resolve (target: other)
```

### Campus.Problems.UnblockLink

Authored path: `Campus.Problems.UnblockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 44.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 47.

```reaction
when RequestBoundary.request (link, path: "/problems/unblock", requestId, session)
then
  Sessioning.use (session)
```

### Campus.Problems.UnblockLink#2

Authored path: `Campus.Problems.UnblockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 44.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 47.

```reaction
when Sessioning.use (session, subject: user), asked by Campus.Problems.UnblockLink
where
  earlier, RequestBoundary.request (link, path: "/problems/unblock", requestId, session)
then
  Wayfinding.unblock (link)
```

### Campus.Problems.UnblockLink#3

Authored path: `Campus.Problems.UnblockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 44.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 47.

```reaction
when Wayfinding.unblock (link), asked by Campus.Problems.UnblockLink#2
where
  earlier, RequestBoundary.request (link, path: "/problems/unblock", requestId, session)
then
  RequestBoundary.respond (link, requestId)
```

### Campus.Problems.UnblockResolvesReports

Authored path: `Campus.Problems.UnblockResolvesReports`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 47.

```reaction
when Wayfinding.unblock (link)
then
  Reporting.resolve (target: link)
```

### Campus.Routing.FindClosest

Authored path: `Campus.Routing.FindClosest`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 24.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 27.

```reaction
when RequestBoundary.request (accessibleOnly, day, hour, indoorsPreferred, keyless, path: "/route/closest", requestId, source, text)
then
  RequestBoundary.respond (closest: former "the places matching (text) nearest (source)" with (accessibleOnly, day, hour, indoorsPreferred, keyless, source, text), requestId)
```

### Campus.Routing.FindRoute

Authored path: `Campus.Routing.FindRoute`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 18.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 21.

```reaction
when RequestBoundary.request (accessibleOnly, day, destination, hour, indoorsPreferred, keyless, path: "/route/find", requestId, source)
then
  RequestBoundary.respond (requestId, route: former "the route from (source) to (destination)" with (accessibleOnly, day, destination, hour, indoorsPreferred, keyless, source))
```

### Campus.Routing.NearestPlace

Authored path: `Campus.Routing.NearestPlace`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 34.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 37.

```reaction
when RequestBoundary.request (latitude, longitude, path: "/route/nearest", requestId)
then
  RequestBoundary.respond (nearest: former "the building nearest (latitude, longitude)" with (latitude, longitude), requestId)
```

### Commons.finishing.ChooseUsername:expired

Authored path: `Commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 26.

```reaction
when RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
where
  CommonsFederating._linkable (attempt) has (linkable: false)
then
  RequestBoundary.respond (error: "SIGN_IN_EXPIRED", requestId)
```

### Commons.finishing.ChooseUsername:linkable

Authored path: `Commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 26.

```reaction
when RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
where
  CommonsFederating._linkable (attempt) has (linkable: true)
then
  Registering.register (username)
```

### Commons.finishing.ChooseUsername:linkable#2

Authored path: `Commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 26.

```reaction
when Registering.register (username, user), asked by Commons.finishing.ChooseUsername:linkable
where
  earlier, RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
then
  CommonsFederating.link (attempt, user)
```

### Commons.finishing.ChooseUsername:linkable#3

Authored path: `Commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 26.

```reaction
when CommonsFederating.link (attempt, user), asked by Commons.finishing.ChooseUsername:linkable#2
then
  Sessioning.start (subject: user)
```

### Commons.finishing.ChooseUsername:linkable#4

Authored path: `Commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 26.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by Commons.finishing.ChooseUsername:linkable#3
where
  earlier, RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### Commons.finishing.FinishCommons

Authored path: `Commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 25.

```reaction
when RequestBoundary.request (attempt, code, path: "/auth/commons/finish", requestId, state)
then
  CommonsFederating.finish (attempt, code, nonce: state)
```

### Commons.finishing.FinishCommons:new#2

Authored path: `Commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 25.

```reaction
when CommonsFederating.finish (attempt, code, nonce: state, username), asked by Commons.finishing.FinishCommons
where
  no CommonsFederating._user (attempt)
then
  Registering.register (username)
```

### Commons.finishing.FinishCommons:new#3

Authored path: `Commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 25.

```reaction
when Registering.register (username, user), asked by Commons.finishing.FinishCommons:new#2
where
  earlier, CommonsFederating.finish (attempt, code, nonce: state, username), asked by Commons.finishing.FinishCommons
then
  CommonsFederating.link (attempt, user)
```

### Commons.finishing.FinishCommons:new#4

Authored path: `Commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 25.

```reaction
when CommonsFederating.link (attempt, user), asked by Commons.finishing.FinishCommons:new#3
then
  Sessioning.start (subject: user)
```

### Commons.finishing.FinishCommons:new#5

Authored path: `Commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 25.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by Commons.finishing.FinishCommons:new#4
where
  earlier, RequestBoundary.request (attempt, code, path: "/auth/commons/finish", requestId, state)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### Commons.finishing.FinishCommons:returning#2

Authored path: `Commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 25.

```reaction
when CommonsFederating.finish (attempt, code, nonce: state, username), asked by Commons.finishing.FinishCommons
where
  CommonsFederating._user (attempt) has (user)
then
  Sessioning.start (subject: user)
```

### Commons.finishing.FinishCommons:returning#3

Authored path: `Commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 25.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by Commons.finishing.FinishCommons:returning#2
where
  earlier, RequestBoundary.request (attempt, code, path: "/auth/commons/finish", requestId, state)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### Commons.identifying.Linked

Authored path: `Commons.identifying.Linked`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 31.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 34.

```reaction
when RequestBoundary.request (path: "/auth/commons/linked", requestId, session)
then
  Sessioning.use (session)
```

### Commons.identifying.Linked#2

Authored path: `Commons.identifying.Linked`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 31.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 34.

```reaction
when Sessioning.use (session, subject: user), asked by Commons.identifying.Linked
where
  CommonsFederating._linked (user) has (linked)
  earlier, RequestBoundary.request (path: "/auth/commons/linked", requestId, session)
then
  RequestBoundary.respond (linked, requestId)
```

### Commons.starting.StartCommons

Authored path: `Commons.starting.StartCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 7.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 10.

```reaction
when RequestBoundary.request (path: "/auth/commons/start", requestId)
then
  CommonsFederating.start ()
```

### Commons.starting.StartCommons#2

Authored path: `Commons.starting.StartCommons`.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 7.
- Covered by [Signing in with Commons](../design/compositions/Commons.md), line 10.

```reaction
when CommonsFederating.start (address, attempt, expiresAt), asked by Commons.starting.StartCommons
where
  earlier, RequestBoundary.request (path: "/auth/commons/start", requestId)
then
  RequestBoundary.respond (address, attempt, expiresAt, requestId)
```

### DeliverFaultToAsker

```reaction
when any action is faulted, not asked by DeliverFaultToAsker
where
  earlier, RequestBoundary.request (requestId)
then
  RequestBoundary.respondFramework (error: "INTERNAL_ERROR", requestId)
```

### DeliverRefusalToAsker

```reaction
when any action is refused (message), except RequestBoundary
where
  earlier, RequestBoundary.request (requestId)
then
  RequestBoundary.respond (error: message, requestId)
```

### Passwords.entering.Register:accepted

Authored path: `Passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 5.
- Covered by [Passwords](../design/compositions/Passwords.md), line 12.

```reaction
when RequestBoundary.request (password, path: "/auth/register", requestId, username)
where
  Authenticating._acceptable (password) has (acceptable: true)
then
  Registering.register (username)
```

### Passwords.entering.Register:accepted#2

Authored path: `Passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 5.
- Covered by [Passwords](../design/compositions/Passwords.md), line 12.

```reaction
when Registering.register (username, user), asked by Passwords.entering.Register:accepted
where
  earlier, RequestBoundary.request (password, path: "/auth/register", requestId, username)
then
  Authenticating.set (password, user)
```

### Passwords.entering.Register:accepted#3

Authored path: `Passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 5.
- Covered by [Passwords](../design/compositions/Passwords.md), line 12.

```reaction
when Authenticating.set (password, user), asked by Passwords.entering.Register:accepted#2
then
  Sessioning.start (subject: user)
```

### Passwords.entering.Register:accepted#4

Authored path: `Passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 5.
- Covered by [Passwords](../design/compositions/Passwords.md), line 12.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by Passwords.entering.Register:accepted#3
where
  earlier, RequestBoundary.request (password, path: "/auth/register", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### Passwords.entering.Register:refused

Authored path: `Passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 5.
- Covered by [Passwords](../design/compositions/Passwords.md), line 12.

```reaction
when RequestBoundary.request (password, path: "/auth/register", requestId, username)
where
  Authenticating._acceptable (password) has (acceptable: false)
then
  RequestBoundary.respond (error: "INVALID_PASSWORD", requestId)
```

### Passwords.entering.SignIn:known

Authored path: `Passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 7.
- Covered by [Passwords](../design/compositions/Passwords.md), line 13.

```reaction
when RequestBoundary.request (password, path: "/auth/login", requestId, username)
where
  Registering._byUsername (username) has (user)
then
  Authenticating.authenticate (password, user)
```

### Passwords.entering.SignIn:known#2

Authored path: `Passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 7.
- Covered by [Passwords](../design/compositions/Passwords.md), line 13.

```reaction
when Authenticating.authenticate (password, user), asked by Passwords.entering.SignIn:known
then
  Sessioning.start (subject: user)
```

### Passwords.entering.SignIn:known#3

Authored path: `Passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 7.
- Covered by [Passwords](../design/compositions/Passwords.md), line 13.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by Passwords.entering.SignIn:known#2
where
  earlier, RequestBoundary.request (password, path: "/auth/login", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### Passwords.entering.SignIn:unknown

Authored path: `Passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/Passwords.md), line 7.
- Covered by [Passwords](../design/compositions/Passwords.md), line 13.

```reaction
when RequestBoundary.request (password, path: "/auth/login", requestId, username)
where
  no Registering._byUsername (username)
then
  RequestBoundary.respond (error: "INVALID_CREDENTIALS", requestId)
```

### Saved.Favorites.Favorite

Authored path: `Saved.Favorites.Favorite`.
- Covered by [Saved things](../design/compositions/Saved.md), line 11.
- Covered by [Saved things](../design/compositions/Saved.md), line 14.

```reaction
when RequestBoundary.request (path: "/me/favorites/add", place, requestId, session)
then
  Sessioning.use (session)
```

### Saved.Favorites.Favorite:known#2

Authored path: `Saved.Favorites.Favorite`.
- Covered by [Saved things](../design/compositions/Saved.md), line 11.
- Covered by [Saved things](../design/compositions/Saved.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Favorites.Favorite
where
  earlier, RequestBoundary.request (path: "/me/favorites/add", place, requestId, session)
  Wayfinding._place (place)
then
  Favoriting.favorite (item: place, user)
```

### Saved.Favorites.Favorite:known#3

Authored path: `Saved.Favorites.Favorite`.
- Covered by [Saved things](../design/compositions/Saved.md), line 11.
- Covered by [Saved things](../design/compositions/Saved.md), line 14.

```reaction
when Favoriting.favorite (item: place, user), asked by Saved.Favorites.Favorite:known#2
where
  earlier, RequestBoundary.request (path: "/me/favorites/add", place, requestId, session)
then
  RequestBoundary.respond (requestId)
```

### Saved.Favorites.Favorite:unknown#2

Authored path: `Saved.Favorites.Favorite`.
- Covered by [Saved things](../design/compositions/Saved.md), line 11.
- Covered by [Saved things](../design/compositions/Saved.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Favorites.Favorite
where
  earlier, RequestBoundary.request (path: "/me/favorites/add", place, requestId, session)
  no Wayfinding._place (place)
then
  RequestBoundary.respond (error: "NO_SUCH_PLACE", requestId)
```

### Saved.Favorites.Unfavorite

Authored path: `Saved.Favorites.Unfavorite`.
- Covered by [Saved things](../design/compositions/Saved.md), line 11.
- Covered by [Saved things](../design/compositions/Saved.md), line 15.

```reaction
when RequestBoundary.request (path: "/me/favorites/remove", place, requestId, session)
then
  Sessioning.use (session)
```

### Saved.Favorites.Unfavorite#2

Authored path: `Saved.Favorites.Unfavorite`.
- Covered by [Saved things](../design/compositions/Saved.md), line 11.
- Covered by [Saved things](../design/compositions/Saved.md), line 15.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Favorites.Unfavorite
where
  earlier, RequestBoundary.request (path: "/me/favorites/remove", place, requestId, session)
then
  Favoriting.unfavorite (item: place, user)
```

### Saved.Favorites.Unfavorite#3

Authored path: `Saved.Favorites.Unfavorite`.
- Covered by [Saved things](../design/compositions/Saved.md), line 11.
- Covered by [Saved things](../design/compositions/Saved.md), line 15.

```reaction
when Favoriting.unfavorite (item: place, user), asked by Saved.Favorites.Unfavorite#2
where
  earlier, RequestBoundary.request (path: "/me/favorites/remove", place, requestId, session)
then
  RequestBoundary.respond (requestId)
```

### Saved.Journal.FinishTrip

Authored path: `Saved.Journal.FinishTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 31.
- Covered by [Saved things](../design/compositions/Saved.md), line 34.

```reaction
when RequestBoundary.request (destination, meters, path: "/me/trips/finish", requestId, session, source)
then
  Sessioning.use (session)
```

### Saved.Journal.FinishTrip:known#2

Authored path: `Saved.Journal.FinishTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 31.
- Covered by [Saved things](../design/compositions/Saved.md), line 34.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Journal.FinishTrip
where
  earlier, RequestBoundary.request (destination, meters, path: "/me/trips/finish", requestId, session, source)
  Wayfinding._place (place: source)
  Wayfinding._place (place: destination)
then
  Journaling.finish (destination, meters, source, traveller: user)
```

### Saved.Journal.FinishTrip:known#3

Authored path: `Saved.Journal.FinishTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 31.
- Covered by [Saved things](../design/compositions/Saved.md), line 34.

```reaction
when Journaling.finish (destination, meters, source, traveller: user, entry), asked by Saved.Journal.FinishTrip:known#2
where
  earlier, RequestBoundary.request (destination, meters, path: "/me/trips/finish", requestId, session, source)
then
  RequestBoundary.respond (entry, requestId)
```

### Saved.Journal.FinishTrip:unknown-destination#2

Authored path: `Saved.Journal.FinishTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 31.
- Covered by [Saved things](../design/compositions/Saved.md), line 34.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Journal.FinishTrip
where
  earlier, RequestBoundary.request (destination, meters, path: "/me/trips/finish", requestId, session, source)
  no Wayfinding._place (place: destination)
then
  RequestBoundary.respond (error: "NO_SUCH_PLACE", requestId)
```

### Saved.Journal.FinishTrip:unknown-source#2

Authored path: `Saved.Journal.FinishTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 31.
- Covered by [Saved things](../design/compositions/Saved.md), line 34.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Journal.FinishTrip
where
  earlier, RequestBoundary.request (destination, meters, path: "/me/trips/finish", requestId, session, source)
  no Wayfinding._place (place: source)
then
  RequestBoundary.respond (error: "NO_SUCH_PLACE", requestId)
```

### Saved.Mine.ShowMine

Authored path: `Saved.Mine.ShowMine`.
- Covered by [Saved things](../design/compositions/Saved.md), line 5.
- Covered by [Saved things](../design/compositions/Saved.md), line 8.

```reaction
when RequestBoundary.request (path: "/me", requestId, session)
then
  Sessioning.use (session)
```

### Saved.Mine.ShowMine#2

Authored path: `Saved.Mine.ShowMine`.
- Covered by [Saved things](../design/compositions/Saved.md), line 5.
- Covered by [Saved things](../design/compositions/Saved.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Mine.ShowMine
where
  earlier, RequestBoundary.request (path: "/me", requestId, session)
then
  RequestBoundary.respond (favorites: former "the favorites of (user)" with (user), history: former "the recent trips of (user)" with (user), preferences: former "the preferences of (user)" with (user), requestId, totals: former "the trip totals of (user)" with (user), trips: former "the saved trips of (user)" with (user))
```

### Saved.Preferences.SetPreferences

Authored path: `Saved.Preferences.SetPreferences`.
- Covered by [Saved things](../design/compositions/Saved.md), line 25.
- Covered by [Saved things](../design/compositions/Saved.md), line 28.

```reaction
when RequestBoundary.request (indoors, path: "/me/preferences/set", requestId, session, stepFree, units, useLocation)
then
  Sessioning.use (session)
```

### Saved.Preferences.SetPreferences#2

Authored path: `Saved.Preferences.SetPreferences`.
- Covered by [Saved things](../design/compositions/Saved.md), line 25.
- Covered by [Saved things](../design/compositions/Saved.md), line 28.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Preferences.SetPreferences
where
  earlier, RequestBoundary.request (indoors, path: "/me/preferences/set", requestId, session, stepFree, units, useLocation)
then
  Preferring.set (indoors, stepFree, units, useLocation, user)
```

### Saved.Preferences.SetPreferences#3

Authored path: `Saved.Preferences.SetPreferences`.
- Covered by [Saved things](../design/compositions/Saved.md), line 25.
- Covered by [Saved things](../design/compositions/Saved.md), line 28.

```reaction
when Preferring.set (indoors, stepFree, units, useLocation, user), asked by Saved.Preferences.SetPreferences#2
where
  earlier, RequestBoundary.request (indoors, path: "/me/preferences/set", requestId, session, stepFree, units, useLocation)
then
  RequestBoundary.respond (requestId)
```

### Saved.Trips.RemoveTrip

Authored path: `Saved.Trips.RemoveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 22.

```reaction
when RequestBoundary.request (path: "/me/trips/remove", requestId, session, trip)
then
  Sessioning.use (session)
```

### Saved.Trips.RemoveTrip#2

Authored path: `Saved.Trips.RemoveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 22.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Trips.RemoveTrip
where
  earlier, RequestBoundary.request (path: "/me/trips/remove", requestId, session, trip)
then
  Planning.remove (owner: user, trip)
```

### Saved.Trips.RemoveTrip#3

Authored path: `Saved.Trips.RemoveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 22.

```reaction
when Planning.remove (owner: user, trip), asked by Saved.Trips.RemoveTrip#2
where
  earlier, RequestBoundary.request (path: "/me/trips/remove", requestId, session, trip)
then
  RequestBoundary.respond (requestId)
```

### Saved.Trips.SaveTrip

Authored path: `Saved.Trips.SaveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 21.

```reaction
when RequestBoundary.request (accessibleOnly, destination, name, path: "/me/trips/save", requestId, session, source)
then
  Sessioning.use (session)
```

### Saved.Trips.SaveTrip:known#2

Authored path: `Saved.Trips.SaveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 21.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Trips.SaveTrip
where
  earlier, RequestBoundary.request (accessibleOnly, destination, name, path: "/me/trips/save", requestId, session, source)
  Wayfinding._place (place: source)
  Wayfinding._place (place: destination)
then
  Planning.save (accessibleOnly, destination, name, owner: user, source)
```

### Saved.Trips.SaveTrip:known#3

Authored path: `Saved.Trips.SaveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 21.

```reaction
when Planning.save (accessibleOnly, destination, name, owner: user, source, trip), asked by Saved.Trips.SaveTrip:known#2
where
  earlier, RequestBoundary.request (accessibleOnly, destination, name, path: "/me/trips/save", requestId, session, source)
then
  RequestBoundary.respond (requestId, trip)
```

### Saved.Trips.SaveTrip:unknown-destination#2

Authored path: `Saved.Trips.SaveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 21.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Trips.SaveTrip
where
  earlier, RequestBoundary.request (accessibleOnly, destination, name, path: "/me/trips/save", requestId, session, source)
  no Wayfinding._place (place: destination)
then
  RequestBoundary.respond (error: "NO_SUCH_PLACE", requestId)
```

### Saved.Trips.SaveTrip:unknown-source#2

Authored path: `Saved.Trips.SaveTrip`.
- Covered by [Saved things](../design/compositions/Saved.md), line 18.
- Covered by [Saved things](../design/compositions/Saved.md), line 21.

```reaction
when Sessioning.use (session, subject: user), asked by Saved.Trips.SaveTrip
where
  earlier, RequestBoundary.request (accessibleOnly, destination, name, path: "/me/trips/save", requestId, session, source)
  no Wayfinding._place (place: source)
then
  RequestBoundary.respond (error: "NO_SUCH_PLACE", requestId)
```

## Endpoint input contracts

Before recording an action ask, the boundary rejects a body that is not an
object or lacks a required key. The response uses `INVALID_INPUT` and names
the path or missing key. A declared default fills an absent key. Endpoints
not listed here have no explicit input contract.

- `/auth/commons/choose` — requires `attempt`, `username`
- `/auth/commons/finish` — requires `attempt`, `code`, `state`
- `/auth/commons/linked` — requires `session`
- `/auth/login` — requires `password`, `username`
- `/auth/logout` — requires `session`
- `/auth/me` — requires `session`
- `/auth/register` — requires `password`, `username`
- `/map/search` — requires `text`
- `/me` — requires `session`
- `/me/favorites/add` — requires `place`, `session`
- `/me/favorites/remove` — requires `place`, `session`
- `/me/preferences/set` — requires `indoors`, `session`, `stepFree`, `units`, `useLocation`
- `/me/trips/finish` — requires `destination`, `meters`, `session`, `source`
- `/me/trips/remove` — requires `session`, `trip`
- `/me/trips/save` — requires `accessibleOnly`, `destination`, `name`, `session`, `source`
- `/problems/block` — requires `link`, `reason`, `session`
- `/problems/unblock` — requires `link`, `session`
- `/route/closest` — requires `accessibleOnly`, `day`, `hour`, `indoorsPreferred`, `keyless`, `source`, `text`
- `/route/find` — requires `accessibleOnly`, `day`, `destination`, `hour`, `indoorsPreferred`, `keyless`, `source`
- `/route/nearest` — requires `latitude`, `longitude`
