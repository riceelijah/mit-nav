# Live navigation: map, location tracking, rerouting

## Goal

Show the route on a map, and, when a person turns on location, follow their progress: finished steps grey out, the next step is highlighted, and going off course reroutes them from where they are.

## Scope

- Included: a position (latitude, longitude) for every place; a query for the nearest building to a position; step positions in route answers and place positions in search answers; the converter and seed supplying positions; a Leaflet map (from a pinned CDN version, OSM tiles) drawing the route, start, end and the person's position; opt-in geolocation that ticks off outdoor steps when the person reaches each step's place, a "Done" button to advance indoor steps by hand, and automatic rerouting from the nearest building after two readings more than 75 m from the route.
- Excluded: indoor positioning (GPS does not work indoors), turn-by-turn voice, storing locations on the server (positions never leave the browser except the one sent to find the nearest building when rerouting).

## Requirements

- Every place has a position; rooms and floors share their building's position, and Simmons places share Simmons Hall's.
- `_nearest(latitude, longitude)` answers the closest entrance (building) by straight-line distance, or nothing when no place has a position.
- Route steps carry the latitude and longitude of the place they arrive at; search results carry positions.
- Location stays off unless the person turns it on (or their saved preference says to use it); turning it off stops watching.
- Rerouting never happens from a single noisy reading.

## Active decisions

- Positions are building centres (OpenStreetMap footprint centroids, MapIT centres where OSM has no outline), which is enough to draw and follow outdoor legs; indoor steps cannot be tracked and are advanced by hand.
- A place added without a known position gets latitude and longitude 0 and is treated as having none.
- Leaflet 1.9.4 from unpkg and OpenStreetMap's public tiles, with attribution; no new npm dependency.
- Execution mixed: designer and implementation simulated; contract critic delegated to a fresh Claude Code agent.

## Done when

- check:design, generate, check pass; tests cover `_nearest` (closest, ties, none), positions through addPlace, route and search answers.
- In the browser the map draws the Simmons → 32-123 route; with a simulated position the first outdoor step greys out and the next is highlighted; a simulated off-course position reroutes from the nearest building.

## Open questions

None.

## Activity

- Work item started.
- Designer simulated; critic (fresh agent) Revise F1..F7 → repaired → Approve. Implemented; 53 tests; browser checks with mocked geolocation pass.
