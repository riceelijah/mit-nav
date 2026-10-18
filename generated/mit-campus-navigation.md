<!-- Generated from the MIT Campus Navigation assembly. Do not edit. -->
<!-- Manifest producer: @mit-sdg/sync-engine@1.1.0; concept specification: sync-engine.concept-specification@1; renderer: @mit-sdg/sync-engine@1.1.0. -->

# MIT Campus Navigation — assembled read-back

_Assembled by sync-engine from registered concepts and composition. Edit the concept_
_specifications and composition source, then regenerate this file._

## Concepts

### Reporting

Defined in [Reporting](../design/concepts/Reporting.md), line 1.

#### Actions

- `report(reporter: User, target: Target, reason: String) : returns (report: Report)`
- `resolve(target: Target) : returns ()`

#### Queries

- `_open() : many (report: Report, reporter: User, target: Target, reason: String)`
- `_about(target: Target) : many (report: Report, reporter: User, reason: String, status: Status)`

#### Instances

- `Reporting` — instance of `Reporting` — [Application types](../design/types.md), line 15.
  - `Target` is `Wayfinding.Link` — [Application types](../design/types.md), line 17.
  - `User` is `Person` — [Application types](../design/types.md), line 16.

### Wayfinding

Defined in [Wayfinding](../design/concepts/Wayfinding.md), line 1.

#### Actions

- `addPlace(name: String, kind: Kind, floor: Number) : returns (place: Place)`
  - Refuses `DUPLICATE_PLACE`: A place with that name already exists.
- `connect(source: Place, destination: Place, forward: String, backward: String, accessible: Flag, closedFrom: Number, closedUntil: Number, service: String, distance: Number) : returns (link: Link)`
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
- `_search(text: String) : many (place: Place, name: String, kind: Kind, floor: Number)`
- `_link(link: Link) : optional (sourceName: String, destinationName: String, forward: String, service: String)`
- `_blocked() : many (link: Link, sourceName: String, destinationName: String, forward: String, service: String)`
- `_sameService(link: Link) : many (other: Link)`
- `_route(source: Place, destination: Place, accessibleOnly: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, floor: Number)`

#### Instances

- `Wayfinding` — instance of `Wayfinding` — [Application types](../design/types.md), line 13.

## Application types

Concrete types:

- `Person` — [Application types](../design/types.md), line 6.

## Formers

_Formers name result shapes evaluated when asked. The source former owns_
_the authored explanation; this section records the generated shape._

### the blocked connections

Authored path: `Campus.Browsing.BlockedList`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 3.

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

### the open problem reports

Authored path: `Campus.Browsing.ProblemList`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 3.

```former
Former "the open problem reports" — inputs (); bindings (report, reporter, reportedLink, reason, sourceName, destinationName, forward); promises exactly one record — forms:
  a record of
    reports: each Reporting._open () has (reason, report, reporter, target: reportedLink)
      where Wayfinding._link (link: reportedLink) has (destinationName, forward, sourceName)
      form a record of
        destinationName
        forward
        link: reportedLink
        reason
        report
        reporter
        sourceName
```

### the places matching (text)

Authored path: `Campus.Browsing.PlaceSearch`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 3.

```former
Former "the places matching (text)" — inputs (text); bindings (place, name, kind, floor); promises exactly one record — forms:
  a record of
    places: each Wayfinding._search (text) has (floor, kind, name, place)
      form a record of
        floor
        kind
        name
        place
```

### the route from (source) to (destination)

Authored path: `Campus.Routing.Route`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 10.

```former
Former "the route from (source) to (destination)" — inputs (source, destination, accessibleOnly, hour); bindings (step, link, instruction, placeName, floor); promises exactly one record — forms:
  a record of
    steps: each Wayfinding._route (accessibleOnly, destination, hour, source) has (floor, instruction, link, placeName, step)
      form a record of
        floor
        instruction
        link
        placeName
        step
```

## Reactions

### Campus.Browsing.SearchPlaces

Authored path: `Campus.Browsing.SearchPlaces`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 3.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 7.

```reaction
when RequestBoundary.request (path: "/map/search", requestId, text)
then
  RequestBoundary.respond (places: former "the places matching (text)" with (text), requestId)
```

### Campus.Browsing.ShowOverview

Authored path: `Campus.Browsing.ShowOverview`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 3.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 6.

```reaction
when RequestBoundary.request (path: "/map/overview", requestId)
then
  RequestBoundary.respond (blocked: former "the blocked connections", problems: former "the open problem reports", requestId)
```

### Campus.Problems.BlockLink

Authored path: `Campus.Problems.BlockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 16.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 19.

```reaction
when RequestBoundary.request (link, path: "/problems/block", reason, reporter, requestId)
then
  Wayfinding.block (link)
```

### Campus.Problems.BlockLink#2

Authored path: `Campus.Problems.BlockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 16.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 19.

```reaction
when Wayfinding.block (link), asked by Campus.Problems.BlockLink
where
  earlier, RequestBoundary.request (link, path: "/problems/block", reason, reporter, requestId)
then
  Reporting.report (reason, reporter, target: link)
```

### Campus.Problems.BlockLink#3

Authored path: `Campus.Problems.BlockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 16.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 19.

```reaction
when Reporting.report (reason, reporter, target: link, report), asked by Campus.Problems.BlockLink#2
where
  earlier, RequestBoundary.request (link, path: "/problems/block", reason, reporter, requestId)
then
  RequestBoundary.respond (report, requestId)
```

### Campus.Problems.ClearingResolvesSharedReports

Authored path: `Campus.Problems.ClearingResolvesSharedReports`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 23.

```reaction
when Wayfinding.unblock (link)
where
  Wayfinding._sameService (link) has (other)
then
  Reporting.resolve (target: other)
```

### Campus.Problems.UnblockLink

Authored path: `Campus.Problems.UnblockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 20.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 23.

```reaction
when RequestBoundary.request (link, path: "/problems/unblock", requestId)
then
  Wayfinding.unblock (link)
```

### Campus.Problems.UnblockLink#2

Authored path: `Campus.Problems.UnblockLink`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 20.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 23.

```reaction
when Wayfinding.unblock (link), asked by Campus.Problems.UnblockLink
where
  earlier, RequestBoundary.request (link, path: "/problems/unblock", requestId)
then
  RequestBoundary.respond (link, requestId)
```

### Campus.Problems.UnblockResolvesReports

Authored path: `Campus.Problems.UnblockResolvesReports`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 23.

```reaction
when Wayfinding.unblock (link)
then
  Reporting.resolve (target: link)
```

### Campus.Routing.FindRoute

Authored path: `Campus.Routing.FindRoute`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 10.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 13.

```reaction
when RequestBoundary.request (accessibleOnly, destination, hour, path: "/route/find", requestId, source)
then
  RequestBoundary.respond (requestId, route: former "the route from (source) to (destination)" with (accessibleOnly, destination, hour, source))
```

### Campus.Setup.AddPlace

Authored path: `Campus.Setup.AddPlace`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 25.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 28.

```reaction
when RequestBoundary.request (floor, kind, name, path: "/map/add-place", requestId)
then
  Wayfinding.addPlace (floor, kind, name)
```

### Campus.Setup.AddPlace#2

Authored path: `Campus.Setup.AddPlace`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 25.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 28.

```reaction
when Wayfinding.addPlace (floor, kind, name, place), asked by Campus.Setup.AddPlace
where
  earlier, RequestBoundary.request (floor, kind, name, path: "/map/add-place", requestId)
then
  RequestBoundary.respond (place, requestId)
```

### Campus.Setup.Connect

Authored path: `Campus.Setup.Connect`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 25.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 29.

```reaction
when RequestBoundary.request (accessible, backward, closedFrom, closedUntil, destination, distance, forward, path: "/map/connect", requestId, service, source)
then
  Wayfinding.connect (accessible, backward, closedFrom, closedUntil, destination, distance, forward, service, source)
```

### Campus.Setup.Connect#2

Authored path: `Campus.Setup.Connect`.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 25.
- Covered by [MIT campus navigation](../design/compositions/Campus.md), line 29.

```reaction
when Wayfinding.connect (accessible, backward, closedFrom, closedUntil, destination, distance, forward, service, source, link), asked by Campus.Setup.Connect
where
  earlier, RequestBoundary.request (accessible, backward, closedFrom, closedUntil, destination, distance, forward, path: "/map/connect", requestId, service, source)
then
  RequestBoundary.respond (link, requestId)
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

## Endpoint input contracts

Before recording an action ask, the boundary rejects a body that is not an
object or lacks a required key. The response uses `INVALID_INPUT` and names
the path or missing key. A declared default fills an absent key. Endpoints
not listed here have no explicit input contract.

- `/map/add-place` — requires `name`, `kind`, `floor`
- `/map/connect` — requires `source`, `destination`, `forward`, `backward`, `accessible`, `closedFrom`, `closedUntil`, `service`, `distance`
- `/map/search` — requires `text`
- `/problems/block` — requires `link`, `reporter`, `reason`
- `/problems/unblock` — requires `link`
- `/route/find` — requires `source`, `destination`, `accessibleOnly`, `hour`
