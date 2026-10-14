# Simmons Hall navigation

The first version covers one building. Anyone can open the app and see the places and connections that make up Simmons Hall and the problems reported so far. The [overview](former:Simmons.Browsing.Overview) lists places and connections, the [problem list](former:Simmons.Browsing.ProblemList) lists open reports, and the [overview request](reaction:Simmons.Browsing.ShowOverview) answers with both.

```endpoints
Simmons.Browsing.ShowOverview at /map/overview
```

A visitor picks where they are and where they are going, says whether they need a route without stairs, and gives the time of day, because some passages, such as terrace doors, are closed overnight. The [route](former:Simmons.Routing.Route) is computed from the connections that are neither blocked nor closed at that hour, so [asking for a route](reaction:Simmons.Routing.FindRoute) never sends anyone through a passage someone has flagged.

```endpoints
Simmons.Routing.FindRoute at /route/find
```

Anyone can [flag a connection as blocked](reaction:Simmons.Problems.BlockLink) with their name and a reason. The flag takes effect in the connection itself, and the name and reason are kept as a report, so the two are recorded in one request.

```endpoints
Simmons.Problems.BlockLink at /problems/block
Simmons.Problems.UnblockLink at /problems/unblock
```

Anyone can [mark a connection as clear again](reaction:Simmons.Problems.UnblockLink). Because the report belongs to a different concept than the connection, [clearing a connection resolves its open reports](reaction:Simmons.Problems.UnblockResolvesReports) as a reaction, rather than the connection concept knowing about reports.

The map itself is filled in by [adding places](reaction:Simmons.Setup.AddPlace) and [connecting them](reaction:Simmons.Setup.Connect). In this version these are run by a seed script rather than by visitors.

```endpoints
Simmons.Setup.AddPlace at /map/add-place
Simmons.Setup.Connect at /map/connect
```
