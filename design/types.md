# Application types

Visitors have no accounts in this first version. They type a name when they report a problem, and that name is the identity attached to the report.

```types
concrete Person
  A visitor or student who types in their name when reporting a blocked connection.
```

A problem is always reported about a connection between two places, so a report's target is a Wayfinding link.

```instances
instantiate Wayfinding

instantiate Reporting with
  User is Person
  Target is Wayfinding.Link
```
