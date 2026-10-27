# MIT Navigator design document

MIT Navigator gives step-by-step walking directions across MIT, building to building and floor to floor, with step-free and indoor options. My goal throughout was a tool that a visitor or a new student could pick up without knowing MIT's numbering, so that someone who has never heard of the Stata Center can still find 32-123 and get there without stairs.

The specifications at each milestone are in the repository's history, at [P2 (Simmons only)](https://github.com/riceelijah/mit-nav/tree/604ed83/design), [P3 beta](https://github.com/riceelijah/mit-nav/tree/a89bb49/design) and [P4 final](https://github.com/riceelijah/mit-nav/tree/36a46ec/design). The [design notes](design-notes.md) go deeper on the routing redesign, and the core journey is in [journey.md](journey.md).

## How the design changed since the initial concept design

My first design (P1, built in P2) covered only Simmons Hall, with two concepts. Wayfinding held the places, connections, routes and blocked passages, Reporting held who reported a block and why, and a reaction resolved the reports when someone cleared the passage. I entered the map by hand, routes took the fewest connections, and a reporter just typed a name. Each change below came from asking what would make it work for someone new to campus.

- I generated the whole campus instead of entering it by hand. Simmons alone took long enough that I didn't think hand entry would ever reach the rest of MIT, so the map now comes from MIT's room inventory and MapIT's room positions, with OpenStreetMap footpaths and crosswalks outdoors and buildings joined where their corridors meet. The tradeoff is that I depend on those sources, and 58 buildings with no room positions get only one corridor per floor.
- I made search answer to the names people actually use. A visitor types "Lobby 7", "Infinite Corridor", "Outfinite", "MIT Museum" or "bathroom", not "Building 10", so each landmark carries everyday aliases, and the result shows which alias matched so the visitor can tell why "Building E28" came up for "museum".
- I switched routing from the fewest connections to the cheapest walk. Once the map had real distances, fewest connections picked odd elevators and long detours, so each connection now costs the metres walked plus a fixed cost for an elevator ride or a door. Step-free drops stairs, and Indoors makes every outdoor metre cost three times as much, which takes 2-190 to E17 from about 450 m outside to about 87 m. The cost of that factor is a slightly longer total walk, which I think is the right trade in a Boston winter.
- I added real accounts so reports can't be pinned on someone else. Reporting and clearing now need sign-in, either through Commons (MIT's login) for the class or with a username and password for visitors, and the reporter always comes from the session, never from the request. I let any signed-in person mark a passage clear rather than only its reporter, because otherwise a block would outlive its reporter's attention, and that trust is the cost.
- I added Favoriting, Planning (saved trips), Journaling (trips taken and distance walked) and Preferring (default step-free, indoors, location and units). These came from the journey's student who walks the same route every week, and each one is keyed by user, so every action checks the session's own user.
- I added building hours for visitors. Someone without an MIT ID can't open card-access doors outside public hours (weekdays from 6 a.m. to 7 p.m., not on MIT holidays), so a No MIT ID toggle drops those doors at those times rather than sending a visitor to a locked door.
- I dropped letting visitors edit the map. The generated map made editing unnecessary, and I felt that open editing would invite mistakes and vandalism, so visitors report problems instead.

## How the design changed since the P3 visual design

The P3 visual design set the look, and I kept all of it. It borrows from campus signage, with Barlow and Barlow Condensed numerals in navy ink on warm concrete, red only for "follow this", teal for "you" and "accessible", and a map-first layout with a draggable sheet on phones. What changed was mostly the indoor maps, because a route line that crosses walls is exactly what loses someone new to a building.

- The indoor route line now follows the corridors. In P3 it ran straight between room positions, so it often cut through walls, and now the converter traces each floor's hallways from MIT's drawings and every indoor connection carries the path it walks. The plans draw only what I know for certain (the outline, the hallways, stairs and elevators, room numbers at their positions, and the destination), because I found a guessed wall looks exactly like a wrong one.
- There are now two plan styles. Simplified is the traced plan, open to everyone, and MIT drawing lays MIT Facilities' own drawing underneath for people signed in with MIT's login, which is MIT's condition for showing them. The drawings stay out of the public repository and live in the deployed server's private storage, which costs an upload step every time I refit them.
- Plans can show for any building, not just the route's. A toggle on the map switches between On route and All buildings, so someone exploring campus can look inside any building in view at close zoom, and the choice is remembered on that device.
- Testing turned up smaller fixes. Step labels no longer repeat the floor ("Building 32, floor 1, floor 1"), routes no longer cut through a building along OpenStreetMap's indoor line for the Infinite Corridor instead of its own floors, and plan files loading at the same time no longer overwrite each other.

## Reactions and access control

I checked access control again for P4, since persistence and sign-in are where a navigation app can quietly leak someone's routine.

- Commons sign-in links an MIT identity to an account through Federating, and password sign-in goes through Registering and Authenticating. Both start a session through Sessioning, which every protected action requires.
- Favorites, trips, travel history and preferences are read and changed only for the session's own user, and naming another user's trip is answered as if it doesn't exist ("You have no such trip.").
- Reporting and clearing a passage need a session, while routes and the list of current problems need none, so directions still work for someone who never signs in.
- Mistakes get a plain message instead of a blank screen, such as "You're already there." for the same start and destination, or "Turn off step-free to allow stairs." when no step-free route exists.

## Known limits

- 58 buildings have no room positions in MapIT, so their routes use one corridor per floor and they have no plan.
- A phone can't tell where it is indoors, so steps inside are ticked off by hand, and location is opt-in and never stored.
- Seated lecture halls usually aren't traced, because their seating rows fail the area check, so the line ends at the nearest corridor.
