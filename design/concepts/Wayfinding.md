# Wayfinding

## Purpose

Describe how the places on a campus connect, from buildings and outdoor walks down to the floors, stairs, elevators and rooms inside them, so a visitor can be given directions that avoid any passage that is currently unusable.

## Principle

Someone adds the lobby and a room on the second floor, each with where it is on the map, and connects them by an elevator and by a staircase. A visitor who needs a step-free route is sent by the elevator, and one who does not is sent by whichever connection is shortest. When the elevator is blocked, the step-free visitor is told that no route exists, while everyone else is still sent by the stairs. Once the elevator is unblocked, it is offered again. A door onto a terrace that is closed overnight is offered during the day and never offered at 2 in the morning. On a winter day, a visitor who prefers to stay indoors is sent along a corridor rather than across the courtyard beside it, unless the corridor is more than three times as costly.

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
  an outdoor Flag
  a blocked Flag
  a closedFrom Number
  a closedUntil Number
  a service String
  a distance Number
  a path String

  Rule: a connection's path is the line a visitor walks along it, as the positions of its corners from source to destination written "lat,lon lat,lon ..."; an empty path means a straight line between the two places
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

connect(source: Place, destination: Place, forward: String, backward: String, accessible: Flag, outdoor: Flag, closedFrom: Number, closedUntil: Number, service: String, distance: Number, path: String) : returns (link: Link)
  where source not in places or destination not in places
  then
    refuses NO_SUCH_PLACE "Both places must exist before they can be connected."
  where source in places and destination in places
  then
    add a new link with source and destination and forward and backward and accessible and outdoor and closedFrom and closedUntil and service and distance and path, not blocked
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
_closest(source: Place, text: String, accessibleOnly: Flag, indoorsPreferred: Flag, hour: Number) : many (place: Place, name: String, floor: Number, cost: Number)
  Answers up to 5 places, other than the source and never TRANSIT, whose names contain the text ignoring case and that a route from the source reaches under the same rules as _route (no blocked connection, none closed at the hour, only accessible ones when accessibleOnly is true, outdoor ones costing three times their distance when indoorsPreferred is true), ordered by the cost of that route, the place added first on a tie, each with the route's total cost; no rows when the source is unknown or nothing matches.
_link(link: Link) : optional (sourceName: String, destinationName: String, forward: String, service: String)
  Answers the names of the connection's two places, its forward directions, and its service when the link is known, and nothing otherwise.
_blocked() : many (link: Link, sourceName: String, destinationName: String, forward: String, service: String)
  Answers every blocked connection with the names of its two places, its forward directions, and its service, in the order the connections were made, and no rows when nothing is blocked.
_sameService(link: Link) : many (other: Link)
  Answers every other connection that shares the link's service, in the order the connections were made, and no rows when the link is unknown or its service is empty.
_route(source: Place, destination: Place, accessibleOnly: Flag, indoorsPreferred: Flag, hour: Number) : many (step: Number, link: Link, instruction: String, placeName: String, kind: Kind, floor: Number, distance: Number, latitude: Number, longitude: Number, path: String)
  Answers the shortest route from source to destination, where each connection costs the distance it was given when it was made (so a builder can make a short flight of stairs cheaper than waiting for an elevator), as numbered steps starting at 1, each with the distance its connection was given, the kind and position of the place it arrives at, and the connection's path in the direction walked (the path as given when the step goes from the connection's source to its destination, and its corners in reverse order otherwise), never using a blocked connection or one that is closed at the given hour of the day (0 up to 24, so 6.5 is half past six in the morning), and when accessibleOnly is true never using a connection that is not accessible; when indoorsPreferred is true each outdoor connection costs three times its distance, so the route stays inside unless going out saves a lot. Each step still reports the distance its connection was given. Answers no rows when either place is unknown or no route exists, and one row per step in order otherwise. Ties are broken in favor of connections made earlier.
```
