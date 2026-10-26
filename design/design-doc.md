# MIT Navigator: design document (P4)

Step-by-step, floor-by-floor directions across MIT, with step-free and stay-indoors options and shared reports of blocked passages.

Spec links below point to particular commits of `https://github.com/riceelijah/mit-nav`. The current versions are in [`concepts/`](concepts/) and [`compositions/`](compositions/), and the assembled read-back is in [`../generated/mit-campus-navigation.md`](../generated/mit-campus-navigation.md).

> TODO (user): this repository starts at P2 ([604ed83](https://github.com/riceelijah/mit-nav/commit/604ed832fcb1485d1db6c5ff63f208640b939466)). Link or summarise the **P1 concept design** here, and say how it differs from the P2 specs below.

## From earlier milestones to the final app

### Scope: one building to the whole campus
- **P2** covered Simmons Hall only. The map was drawn by hand from its floor plans (`data/simmons.json`), with two concepts, [Wayfinding @604ed83](https://github.com/riceelijah/mit-nav/blob/604ed832fcb1485d1db6c5ff63f208640b939466/design/concepts/Wayfinding.md) and [Reporting @604ed83](https://github.com/riceelijah/mit-nav/blob/604ed832fcb1485d1db6c5ff63f208640b939466/design/concepts/Reporting.md), and one composition, [Simmons @604ed83](https://github.com/riceelijah/mit-nav/blob/604ed832fcb1485d1db6c5ff63f208640b939466/design/compositions/Simmons.md). Picking a start and an end gave a numbered list of steps.
- **Campus** ([62792ea](https://github.com/riceelijah/mit-nav/commit/62792eabfa075993eaf15b2a63308e5c1aa8b6f4)): `bun run campus` builds the map from MIT room inventories and OpenStreetMap building footprints. Every building is a place, and each converted building has floors, elevators, stairs and rooms. The composition was renamed Simmons → [Campus](compositions/Campus.md).
- **Real geometry** ([60913ab](https://github.com/riceelijah/mit-nav/commit/60913ab), [ae5e9d7](https://github.com/riceelijah/mit-nav/commit/ae5e9d7)): each floor has its own corridor network at MapIT positions, outdoor walks follow OSM footpaths, sidewalks and crosswalks, and touching buildings are joined only where both have a corridor at the shared wall. Simmons is now generated like every other building, and the hand-made map was retired.
- **Journey**: [P2 journey](https://github.com/riceelijah/mit-nav/blob/604ed832fcb1485d1db6c5ff63f208640b939466/design/journey.md) (Simmons lobby to 8C) → [current journey](journey.md) (Simmons to the 32-123 lecture hall in Stata, step-free, via Fairchild).

### Concepts: 2 → 10
| Concept | Role | Versions |
|---|---|---|
| Wayfinding | places, connections, blocking, routing, search | [P2](https://github.com/riceelijah/mit-nav/blob/604ed832fcb1485d1db6c5ff63f208640b939466/design/concepts/Wayfinding.md) · [campus queries](https://github.com/riceelijah/mit-nav/blob/62792eabfa075993eaf15b2a63308e5c1aa8b6f4/design/concepts/Wayfinding.md) · [positions, `_nearest`](https://github.com/riceelijah/mit-nav/blob/c8600ec9b710c722fa82a5d9d95353d12e8645e5/design/concepts/Wayfinding.md) · [`_closest`](https://github.com/riceelijah/mit-nav/blob/a83ab8137c5c206edf2e583feb1ab2abd7e081ee/design/concepts/Wayfinding.md) · [indoors preferred](https://github.com/riceelijah/mit-nav/blob/f0b15dd04de08ac6c724bcbdeccda04ac85790b8/design/concepts/Wayfinding.md) · [current](concepts/Wayfinding.md) |
| Reporting | who reported what, and why | [unchanged since P2](https://github.com/riceelijah/mit-nav/blob/604ed832fcb1485d1db6c5ff63f208640b939466/design/concepts/Reporting.md). Only its `User` was bound to a real account. |
| Preferring | step-free, indoors, location, units | [first](https://github.com/riceelijah/mit-nav/blob/da4105e367116b3e925636f4a6087044528f86c0/design/concepts/Preferring.md) · [+units](https://github.com/riceelijah/mit-nav/blob/a83ab8137c5c206edf2e583feb1ab2abd7e081ee/design/concepts/Preferring.md) · [+indoors](https://github.com/riceelijah/mit-nav/blob/f0b15dd04de08ac6c724bcbdeccda04ac85790b8/design/concepts/Preferring.md) |
| Favoriting, Planning, Journaling | starred places, saved trips, finished trips with totals | added in [da4105e](https://github.com/riceelijah/mit-nav/commit/da4105e367116b3e925636f4a6087044528f86c0) ([Journaling](https://github.com/riceelijah/mit-nav/blob/da4105e367116b3e925636f4a6087044528f86c0/design/concepts/Journaling.md) later got a 0–100 km check) |
| Registering, Authenticating, Sessioning, Federating | passwords and Commons sign-in | copied from ConceptBox in [da4105e](https://github.com/riceelijah/mit-nav/commit/da4105e367116b3e925636f4a6087044528f86c0), along with its Accounts, Passwords and Commons compositions |

- The concepts never call each other. [Campus](compositions/Campus.md) connects Wayfinding to Reporting, and [Saved](compositions/Saved.md) connects the personal concepts to accounts.

### Visual and interaction design (vs. P3)
> TODO (user): confirm that the P3 visual design is the map-first redesign below ([a83ab81](https://github.com/riceelijah/mit-nav/commit/a83ab8137c5c206edf2e583feb1ab2abd7e081ee) + [52d302c](https://github.com/riceelijah/mit-nav/commit/52d302c24189795b897bf83c57d7eb14f881ebde)). If P3 was a separate mock-up or study, link it and note the differences. A before/after screenshot would help here.
- **P2**: a form with pickers and a step list. **P3 beta** ([a83ab81](https://github.com/riceelijah/mit-nav/commit/a83ab8137c5c206edf2e583feb1ab2abd7e081ee)): a full-screen map with a side panel on desktop and a bottom sheet on phones, the destination shown as a door plaque, and tabs for Route, Saved and Problems. Type is Barlow.
- **Palette** ([52d302c](https://github.com/riceelijah/mit-nav/commit/52d302c24189795b897bf83c57d7eb14f881ebde)): MIT red for the route, deep navy for text, peach (olive on the map) for the current step, and teal for "you" and step-free.
- **Since the beta**: the phone sheet can be dragged and has a bigger handle ([9571902](https://github.com/riceelijah/mit-nav/commit/9571902)). A badge marks each change of floor on the route line ([083e7b1](https://github.com/riceelijah/mit-nav/commit/083e7b1)). The route line follows corridors instead of crossing walls ([55cfd46](https://github.com/riceelijah/mit-nav/commit/55cfd46), [dca1d23](https://github.com/riceelijah/mit-nav/commit/dca1d23)), and plans show one floor at a time with a floor switcher.
- **Live navigation** ([c8600ec](https://github.com/riceelijah/mit-nav/commit/c8600ec9b710c722fa82a5d9d95353d12e8645e5)): location is opt-in. Outdoor steps tick off as you reach each building, and indoor steps are marked "Done" by hand. After two readings more than 75 m off the route, the app reroutes from the nearest building. Positions stay in the browser.

## Significant decisions

- **The map has no editing API.** P2 had open `/map/add-place` and `/map/connect` endpoints. Since [d1ff714](https://github.com/riceelijah/mit-nav/commit/d1ff714) the seed writes Wayfinding's collections directly and updates them in place. Accounts, favorites, trips, history and blocks survive a map update. `bun run start` seeds before serving.
- **The browser never loads the whole map.** Search runs on the server (at most 40 matches per request), and the Problems tab lists only blocked connections. Reason: listing about 9k places and 15k connections through the engine took 21 s (work brief [`mit-nav`](../.sync-engine/work/mit-nav/brief.md)).
- **One elevator, one flag.** All rides of an elevator share a `service`, so flagging one ride blocks the whole elevator. Clearing it resolves the reports on every ride (`_sameService`, added in [62792ea](https://github.com/riceelijah/mit-nav/blob/62792eabfa075993eaf15b2a63308e5c1aa8b6f4/design/concepts/Wayfinding.md)).
- **Reports need an account.** P2 asked for a typed name. Now flagging and clearing need a session, and each report belongs to the signed-in user (Commons class account or password) ([da4105e](https://github.com/riceelijah/mit-nav/commit/da4105e367116b3e925636f4a6087044528f86c0)).
- **Accessibility is in the route.** Step-free routes skip stairs and outdoor steps, except steps mapped with a ramp. "Prefer indoors" makes outdoor connections cost 3× their distance, so a route goes outside only when that saves a lot ([f0b15dd](https://github.com/riceelijah/mit-nav/commit/f0b15dd04de08ac6c724bcbdeccda04ac85790b8)).
- **Honest distances.** The distance shown is the sum of the metres written in the directions. Outdoor path segments carry no per-bend penalty. Distances can be shown in metres, feet or walking minutes ([a83ab81](https://github.com/riceelijah/mit-nav/commit/a83ab8137c5c206edf2e583feb1ab2abd7e081ee)).
- **Nearest of a kind.** One tap finds the nearest restroom, food, study space or lounge, measured by route rather than straight-line distance (Wayfinding `_closest`).
- **MIT data stays private.** `data/raw/` (inventories and PDFs) is never committed or put in the image. Only derived room positions and traced outlines ship, and the repository should stay private (see README).

## Floor plans

- **Schematic**: drawn from the room inventory and MapIT positions. Each room is the part of the building outline nearest to it, capped at its real floor area ([14c2154](https://github.com/riceelijah/mit-nav/commit/14c2154), [abeaa60](https://github.com/riceelijah/mit-nav/commit/abeaa60)).
- **Traced outlines**: `scripts/fit-drawings.py` fits MIT's floor-plan PDFs to the map by OCR on the room labels, then traces each room's open floor inside the walls, bounded by the building footprint. Only these shapes are committed, never the drawing ([338c07e](https://github.com/riceelijah/mit-nav/commit/338c07e), [c7ccd33](https://github.com/riceelijah/mit-nav/commit/c7ccd33), [55cfd46](https://github.com/riceelijah/mit-nav/commit/55cfd46), [fc181c5](https://github.com/riceelijah/mit-nav/commit/fc181c5)). About 13,800 of the 19,200 rooms on the plans are traced.
- **Drawing**: traced outlines are tidied in the browser before drawing (`web/shapes.ts`): raster teeth and doorway notches are cut off and near-straight runs merged. Rooms are white, corridors a pale tint, and the building outline shows through between them in wall grey; rooms that did not trace are outlined dashed, as a guess. Room numbers appear only where they fit inside the room at the current zoom. Route lines use the untidied outlines on a cheapest path through corridors ([a89bb49](https://github.com/riceelijah/mit-nav/commit/a89bb49)). The "MIT drawing" layer appears only on a machine that has the PDFs.

## Process

- Each bounded change was run as a sync-engine work unit, with a brief and designer/critic/application prompts and responses under [`.sync-engine/work/`](../.sync-engine/work/). For example: [accounts](../.sync-engine/work/accounts/brief.md), [frontend-redesign](../.sync-engine/work/frontend-redesign/brief.md), [traced-rooms](../.sync-engine/work/traced-rooms/brief.md).

## Known limits

- GPS does not work indoors, so indoor steps advance by hand.
- Buildings without a room list are a single place at their entrance.
- The traced outlines are only as good as the PDFs. Rooms that don't trace keep the schematic shape.
