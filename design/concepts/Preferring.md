# Preferring

## Purpose

Remember how each person likes the app to behave, so they do not have to set it up again on every visit or device.

## Principle

Ana has never set anything, so she gets the defaults: routes are not restricted to step-free, and the app does not use her location. She turns on step-free routes and location; the next time she reads her preferences, both are on. Ben's preferences are still the defaults.

## Types

```types
external User
  The person whose preferences these are.
```

## State

```state
a set of Preferences with
  a unique user User
  a stepFree Flag
  a useLocation Flag
```

## Actions

```actions
set(user: User, stepFree: Flag, useLocation: Flag) : returns ()
  where true
  then
    set the user's preferences to stepFree and useLocation, adding them if the user has none
    returns
```

## Queries

```queries
_preferences(user: User) : one (stepFree: Flag, useLocation: Flag)
  Answers the user's preferences, or false for both when the user has never set them.
```
