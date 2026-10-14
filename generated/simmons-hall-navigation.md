<!-- Generated from the Simmons Hall Navigation assembly. Do not edit. -->
<!-- Manifest producer: @mit-sdg/sync-engine@1.1.0; concept specification: sync-engine.concept-specification@1; renderer: @mit-sdg/sync-engine@1.1.0. -->

# Simmons Hall Navigation — assembled read-back

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
- `_route(source: Place, destination: Place, accessibleOnly: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, floor: Number)`

#### Instances

- `Wayfinding` — instance of `Wayfinding` — [Application types](../design/types.md), line 13.

## Application types

Concrete types:

- `Person` — [Application types](../design/types.md), line 6.

## Formers

_Formers name result shapes evaluated when asked. The source former owns_
_the authored explanation; this section records the generated shape._

### the Simmons Hall overview

Authored path: `Simmons.Browsing.Overview`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 3.

```former
Former "the Simmons Hall overview" — inputs (); bindings (place, name, kind, floor, link, sourceName, destinationName, forward, accessible, blocked, closedFrom, closedUntil, service); promises exactly one record — forms:
  a record of
    links: each Wayfinding._links () has (accessible, blocked, closedFrom, closedUntil, destinationName, forward, link, service, sourceName)
      form a record of
        accessible
        blocked
        closedFrom
        closedUntil
        destinationName
        forward
        link
        service
        sourceName
    places: each Wayfinding._places () has (floor, kind, name, place)
      form a record of
        floor
        kind
        name
        place
```

### the open problem reports

Authored path: `Simmons.Browsing.ProblemList`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 3.

```former
Former "the open problem reports" — inputs (); bindings (report, reporter, reportedLink, reason); promises exactly one record — forms:
  a record of
    reports: each Reporting._open () has (reason, report, reporter, target: reportedLink)
      form a record of
        link: reportedLink
        reason
        report
        reporter
```

### the route from (source) to (destination)

Authored path: `Simmons.Routing.Route`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 9.

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

### Simmons.Browsing.ShowOverview

Authored path: `Simmons.Browsing.ShowOverview`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 3.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 6.

```reaction
when RequestBoundary.request (path: "/map/overview", requestId)
then
  RequestBoundary.respond (overview: former "the Simmons Hall overview", problems: former "the open problem reports", requestId)
```

### Simmons.Problems.BlockLink

Authored path: `Simmons.Problems.BlockLink`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 15.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 18.

```reaction
when RequestBoundary.request (link, path: "/problems/block", reason, reporter, requestId)
then
  Wayfinding.block (link)
```

### Simmons.Problems.BlockLink#2

Authored path: `Simmons.Problems.BlockLink`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 15.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 18.

```reaction
when Wayfinding.block (link), asked by Simmons.Problems.BlockLink
where
  earlier, RequestBoundary.request (link, path: "/problems/block", reason, reporter, requestId)
then
  Reporting.report (reason, reporter, target: link)
```

### Simmons.Problems.BlockLink#3

Authored path: `Simmons.Problems.BlockLink`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 15.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 18.

```reaction
when Reporting.report (reason, reporter, target: link, report), asked by Simmons.Problems.BlockLink#2
where
  earlier, RequestBoundary.request (link, path: "/problems/block", reason, reporter, requestId)
then
  RequestBoundary.respond (report, requestId)
```

### Simmons.Problems.UnblockLink

Authored path: `Simmons.Problems.UnblockLink`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 19.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 22.

```reaction
when RequestBoundary.request (link, path: "/problems/unblock", requestId)
then
  Wayfinding.unblock (link)
```

### Simmons.Problems.UnblockLink#2

Authored path: `Simmons.Problems.UnblockLink`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 19.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 22.

```reaction
when Wayfinding.unblock (link), asked by Simmons.Problems.UnblockLink
where
  earlier, RequestBoundary.request (link, path: "/problems/unblock", requestId)
then
  RequestBoundary.respond (link, requestId)
```

### Simmons.Problems.UnblockResolvesReports

Authored path: `Simmons.Problems.UnblockResolvesReports`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 22.

```reaction
when Wayfinding.unblock (link)
then
  Reporting.resolve (target: link)
```

### Simmons.Routing.FindRoute

Authored path: `Simmons.Routing.FindRoute`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 9.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 12.

```reaction
when RequestBoundary.request (accessibleOnly, destination, hour, path: "/route/find", requestId, source)
then
  RequestBoundary.respond (requestId, route: former "the route from (source) to (destination)" with (accessibleOnly, destination, hour, source))
```

### Simmons.Setup.AddPlace

Authored path: `Simmons.Setup.AddPlace`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 24.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 27.

```reaction
when RequestBoundary.request (floor, kind, name, path: "/map/add-place", requestId)
then
  Wayfinding.addPlace (floor, kind, name)
```

### Simmons.Setup.AddPlace#2

Authored path: `Simmons.Setup.AddPlace`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 24.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 27.

```reaction
when Wayfinding.addPlace (floor, kind, name, place), asked by Simmons.Setup.AddPlace
where
  earlier, RequestBoundary.request (floor, kind, name, path: "/map/add-place", requestId)
then
  RequestBoundary.respond (place, requestId)
```

### Simmons.Setup.Connect

Authored path: `Simmons.Setup.Connect`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 24.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 28.

```reaction
when RequestBoundary.request (accessible, backward, closedFrom, closedUntil, destination, distance, forward, path: "/map/connect", requestId, service, source)
then
  Wayfinding.connect (accessible, backward, closedFrom, closedUntil, destination, distance, forward, service, source)
```

### Simmons.Setup.Connect#2

Authored path: `Simmons.Setup.Connect`.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 24.
- Covered by [Simmons Hall navigation](../design/compositions/Simmons.md), line 28.

```reaction
when Wayfinding.connect (accessible, backward, closedFrom, closedUntil, destination, distance, forward, service, source, link), asked by Simmons.Setup.Connect
where
  earlier, RequestBoundary.request (accessible, backward, closedFrom, closedUntil, destination, distance, forward, path: "/map/connect", requestId, service, source)
then
  RequestBoundary.respond (link, requestId)
```

## Endpoint input contracts

Before recording an action ask, the boundary rejects a body that is not an
object or lacks a required key. The response uses `INVALID_INPUT` and names
the path or missing key. A declared default fills an absent key. Endpoints
not listed here have no explicit input contract.

- `/map/add-place` — requires `name`, `kind`, `floor`
- `/map/connect` — requires `source`, `destination`, `forward`, `backward`, `accessible`, `closedFrom`, `closedUntil`, `service`, `distance`
- `/problems/block` — requires `link`, `reporter`, `reason`
- `/problems/unblock` — requires `link`
- `/route/find` — requires `source`, `destination`, `accessibleOnly`, `hour`
