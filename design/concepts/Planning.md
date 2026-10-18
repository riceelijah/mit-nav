# Planning

## Purpose

Let each person save the trips they make often under names of their own, so a regular trip can be started again in one step.

## Principle

Ana saves "To lab" from Simmons Hall to 32-G904, step-free. It appears in her trips and in nobody else's. Saving another trip called "To lab" is refused because the name is taken, while Ben can save a trip with that name for himself. Ben cannot remove Ana's trip. When Ana removes "To lab", her list is empty again.

## Types

```types
external User
  The person who saved the trip.

external Place
  Where a trip starts or ends.
```

## State

```state
a set of Trips with
  an owner User
  a name String
  a source Place
  a destination Place
  an accessibleOnly Flag
  an order Number

  Rule: a person's trips have different names
```

## Actions

```actions
save(owner: User, name: String, source: Place, destination: Place, accessibleOnly: Flag) : returns (trip: Trip)
  where owner has a trip called name
  then
    refuses TRIP_NAME_TAKEN "You already have a trip with that name."
  where name is empty
  then
    refuses EMPTY_TRIP_NAME "A trip needs a name."
  where name is not empty and owner has no trip called name
  then
    add a new trip with owner and name and source and destination and accessibleOnly, after every earlier trip
    returns trip

remove(owner: User, trip: Trip) : returns ()
  where trip not in trips or trip's owner is not owner
  then
    refuses NO_SUCH_TRIP "You have no such trip."
  where trip in trips and trip's owner is owner
  then
    delete trip
    returns
```

## Queries

```queries
_trips(owner: User) : many (trip: Trip, name: String, source: Place, destination: Place, accessibleOnly: Flag)
  Answers the owner's trips in the order they were saved, and no rows when they have none.
```
