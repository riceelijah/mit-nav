# Reporting

## Purpose

Remember who reported a problem with something and why, so others can see what is wrong and when it has been dealt with.

## Principle

Barish reports the elevator as out of service because the doors will not close. Others can see the open report and its reason. Once the problem is resolved, the report no longer appears among the open ones but is still kept.

## Types

```types
external User
  The person who makes a report.

external Target
  The thing a report is about.

Status is OPEN or RESOLVED
  Whether the problem is still outstanding.
```

## State

```state
a set of Reports with
  a reporter User
  a target Target
  a reason String
  a status Status
```

## Actions

```actions
report(reporter: User, target: Target, reason: String) : returns (report: Report)
  where true
  then
    add a new report with reporter and target and reason, with status OPEN
    returns report

resolve(target: Target) : returns ()
  where true
  then
    set the status of every open report about target to RESOLVED
    returns
```

## Queries

```queries
_open() : many (report: Report, reporter: User, target: Target, reason: String)
  Answers every report whose status is OPEN, in the order they were made, and no rows when there are none.
_about(target: Target) : many (report: Report, reporter: User, reason: String, status: Status)
  Answers every report about the target, open or resolved, in the order they were made.
```
