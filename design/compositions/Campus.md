# MIT campus navigation

The map covers the MIT campus. Every building is a place, and buildings are joined by outdoor walks. Inside the buildings whose room lists have been converted, each floor is a corridor, joined to the floors above and below by the building's stairs and elevators, with the classrooms, labs, offices and other rooms a visitor looks for opening off it. Buildings that touch are joined indoors on the floors they share. Simmons Hall keeps its detailed hand-made map and joins the campus through its main lobby entrance. The campus has thousands of places and connections, so the app never sends the whole map to the browser. A visitor finds a place by typing part of its name: the [place search](former:Campus.Browsing.PlaceSearch) answers at most 40 matching places that can be a start or a destination, with entrances first (every building and the Simmons lobby are entrances), and the [search request](reaction:Campus.Browsing.SearchPlaces) carries the typed text and answers with those places; when nothing matches the answer is an empty list, not a refusal. Anyone can also see the problems reported so far: the [problem list](former:Campus.Browsing.ProblemList) lists open reports, each with the names of its connection's two places and its directions, and the [blocked list](former:Campus.Browsing.BlockedList) lists every blocked connection the same way, including any blocked without a report, so it can still be marked clear. The [overview request](reaction:Campus.Browsing.ShowOverview) takes no input and answers with both lists. Generated place names begin with the building ("Building 32, floor 1", "32-123 Lecture Hall"), so typing a building or room number finds them.

```endpoints
Campus.Browsing.ShowOverview at /map/overview
Campus.Browsing.SearchPlaces at /map/search
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because some passages, such as terrace doors, are closed overnight. The [route](former:Campus.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Campus.Routing.FindRoute) never sends anyone through a passage someone has flagged. The request carries the two places, the step-free flag, and the hour, and answers with the numbered steps, each carrying the connection it uses, which is where a visitor starts when flagging a passage; when either place is unknown or no route exists, the answer is an empty list rather than a refusal.

```endpoints
Campus.Routing.FindRoute at /route/find
```

Anyone can [flag a connection as blocked](reaction:Campus.Problems.BlockLink) with their name and a reason. The flag takes effect in the connection itself, and the name and reason are kept as a report, so the two are recorded in one request. The request carries the connection, the reporter's name, and the reason, and answers with the report. The connection is blocked first, and the report is recorded only once the block has succeeded, so a refused block records nothing: an unknown connection is refused with NO_SUCH_LINK, and one that is already blocked with ALREADY_BLOCKED. Because every ride of one elevator shares a service, flagging any ride takes the whole elevator out, and flagging another ride of an elevator that is already out is refused with ALREADY_BLOCKED without a second report. If recording the report fails after the block, the connection stays blocked without a report; anyone can mark it clear and flag it again.

```endpoints
Campus.Problems.BlockLink at /problems/block
Campus.Problems.UnblockLink at /problems/unblock
```

Anyone can [mark a connection as clear again](reaction:Campus.Problems.UnblockLink). Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Campus.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports. The request carries the connection and answers with it; an unknown connection is refused with NO_SUCH_LINK, and one that is not blocked with NOT_BLOCKED. Clearing one ride of an elevator clears every ride that shares its service, so [clearing also resolves the reports on those rides](reaction:Campus.Problems.ClearingResolvesSharedReports); otherwise a report against another ride would stay open after the elevator is back.

The map itself is filled in by [adding places](reaction:Campus.Setup.AddPlace) and [connecting them](reaction:Campus.Setup.Connect). In this version these are run by a seed script, which loads the Simmons map and the campus map generated from MIT's room inventory and building footprints, rather than by visitors. Adding a place carries its name, kind, and floor and answers with the place, refusing a name already in use with DUPLICATE_PLACE; connecting carries both places and the connection's directions, step-free flag, closing hours, service, and distance and answers with the connection, refusing an unknown place with NO_SUCH_PLACE. Because this version has no accounts, these endpoints are open to anyone who calls them; restricting them belongs with sign-in.

```endpoints
Campus.Setup.AddPlace at /map/add-place
Campus.Setup.Connect at /map/connect
```
