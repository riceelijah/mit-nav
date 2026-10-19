# Journaling

## Purpose

Keep a record of the trips each person finishes, so they can look back at where they have been and see how far they have gone in total.

## Principle

Ana finishes a trip from Simmons Hall to 32-G904 of about 900 metres, then one back of about 900 metres. Her history lists the trip back first, and her totals are 2 trips and 1800 metres. Ben, who has finished nothing, sees an empty history and totals of 0 trips and 0 metres. A finished trip with a negative distance, or one longer than 100 km (no walk across campus is), is refused and leaves her totals as they were.

## Types

```types
external User
  The person who made the trip.

external Place
  Where a trip started or ended.
```

## State

```state
a seq of Entries with
  a traveller User
  a source Place
  a destination Place
  a meters Number
```

## Actions

```actions
finish(traveller: User, source: Place, destination: Place, meters: Number) : returns (entry: Entry)
  where meters is less than 0 or more than 100000
  then
    refuses INVALID_DISTANCE "A trip is between 0 and 100 km."
  where meters is at least 0 and at most 100000
  then
    append a new entry with traveller and source and destination and meters
    returns entry
```

## Queries

```queries
_history(traveller: User) : many (entry: Entry, source: Place, destination: Place, meters: Number)
  Answers the traveller's 20 most recent entries, newest first, and no rows when they have none.
_totals(traveller: User) : one (trips: Number, meters: Number)
  Answers how many entries the traveller has and the sum of their metres, both 0 when they have none.
```
