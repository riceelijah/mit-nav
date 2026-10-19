# Preferring

## Purpose

Remember how each person likes the app to behave, so they do not have to set it up again on every visit or device.

## Principle

Ana has never set anything, so she gets the defaults: routes are not restricted to step-free, the app does not use her location, and distances are in metres. She turns on step-free routes and location and asks for distances in walking minutes; the next time she reads her preferences, all three are as she set them. Ben's preferences are still the defaults.

## Types

```types
external User
  The person whose preferences these are.

Units is METERS or FEET or MINUTES
  How distances are reported: metres (kilometres from 1000 m), feet (miles from 1000 ft), or minutes of walking at 80 metres a minute.
```

## State

```state
a set of Preferences with
  a unique user User
  a stepFree Flag
  a useLocation Flag
  a units Units
```

## Actions

```actions
set(user: User, stepFree: Flag, useLocation: Flag, units: Units) : returns ()
  where true
  then
    set the user's preferences to stepFree and useLocation and units, adding them if the user has none
    returns
```

## Queries

```queries
_preferences(user: User) : one (stepFree: Flag, useLocation: Flag, units: Units)
  Answers the user's preferences, or false, false and METERS when the user has never set them; preferences saved before units existed answer METERS for units.
```
