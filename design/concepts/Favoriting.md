# Favoriting

## Purpose

Let each person keep a short list of the items they come back to, so they can pick one again without searching for it.

## Principle

Ana favorites the Stata Center and her lab, 32-G904. Both appear in her favorites, newest first, and in nobody else's. Favoriting the lab again is refused because it is already there. When she unfavorites the Stata Center, only the lab is left; unfavoriting it a second time is refused because it is no longer there.

## Types

```types
external User
  The person whose favorites these are.

external Item
  The thing a person favorites.
```

## State

```state
a set of Favorites with
  a user User
  an item Item
  an order Number

  Rule: a person favorites an item at most once
```

## Actions

```actions
favorite(user: User, item: Item) : returns ()
  where user has item among their favorites
  then
    refuses ALREADY_FAVORITE "That is already a favorite."
  where user does not have item among their favorites
  then
    add a new favorite with user and item, after every earlier favorite
    returns

unfavorite(user: User, item: Item) : returns ()
  where user does not have item among their favorites
  then
    refuses NOT_FAVORITE "That is not a favorite."
  where user has item among their favorites
  then
    delete the favorite of user for item
    returns
```

## Queries

```queries
_favorites(user: User) : many (item: Item)
  Answers the user's favorite items, newest first, and no rows when they have none.
```
