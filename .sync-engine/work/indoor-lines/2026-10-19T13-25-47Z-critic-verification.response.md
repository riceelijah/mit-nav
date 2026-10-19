## Verdict
Revise

The revised rules fix the gaps reported in the implementation blocker: corridors carved up by nearest-label splits, unlabelled corridor stretches, and doorway slivers. Tracing now:
- closes doorways of up to 0.9 m without thickening walls,
- grows the rooms that share an open area up to their inventory area and gives corridors the rest,
- grows each space back into the doorways, and
- keeps unlabelled open floor.

The page path finding gives other rooms a cost of 4×. Server behaviour is unchanged: no endpoint, reaction, former or computation is added, the off-course check still uses straight lines, and plan files are still fetched for every route building at once. Five issues remain.

## Findings

- **B1-implementation: Resolved for the stated gaps.** These are the parts of the blocker resolved:
  - Corridors are no longer carved up, because corridors take what remains after the non-circulation rooms have grown.
  - Unlabelled stretches are kept as unlabelled open floor.
  - Doorway slivers are closed by growing spaces back into the doorways.
  - A route can pass through other rooms when needed.

  The remaining findings come directly from these changes.

- **V1: The walkable set goes beyond the brief's scope.** The brief, which is unchanged, still limits path finding to "that floor's traced circulation outlines plus the two end rooms' outlines". The contract now also walks through:
  - unlabelled open floor, at cost 1, and
  - every other traced room, at 4×.

  This fits the brief's goal of no lines through walls, but the brief's Scope needs revising to match. Otherwise the contract is out of scope.

- **V2: Recovered rooms are now walkable, which undoes the safety reason in R1 and M3.** Recovered rooms are footprint-cut rooms that were given their unbounded outline. Corridors, lobbies and bridges were excluded from recovery "so the drawn route line is never led outdoors through one", and the narrowed brief requirement relies on that. Now any recovered non-circulation room is walkable at 4× as an intermediate space, not only as an end room. This creates two risks:
  - Such an outline comes from the pass without the footprint. It can contain outdoor space and still pass the factor-of-two area check.
  - A recovered outline may overlap a bounded outline "beyond the wall they share". That overlap gives the grid a step across the wall.

  Either way, the line could be led outdoors or through a wall. The contract must say whether recovered outlines are walkable, or why they are safe to walk.

- **V3: Unlabelled leftover in shared areas is not filtered.** Two kinds of space are kept as unlabelled open floor, and only one is filtered:
  - Unlabelled open floor that contains no room's position must be at least 4 m² and must not reach the footprint's edge. Without that edge filter, that space could include the strip outside the building's walls.
  - Leftover space in a shared area with no corridor, lobby or bridge also becomes unlabelled open floor, which costs 1 to walk. This leftover has neither condition.

  The tracing area extends a metre beyond the outline. A doorway wider than 0.9 m (for example a double entrance door) stays open, so a shared area can include part of that outside strip. The leftover can then lead the line outside the wall at full walking preference. The same applies to a corridor or lobby that takes "the rest" of such an area.
  - The contract's claim that "open entrance doors never join a lobby to the outdoors" no longer holds once doorways wider than 0.9 m remain open. That claim is now what makes the line safe to walk.

- **V4: Unlabelled open floor is not preserved when regenerating elsewhere.** The converter writes each floor's unlabelled open floor into the plan files. However, the rule for a machine without local outlines keeps only "the outlines that building's current plan file already has, for rooms still on the same floor". Unlabelled open floor belongs to no room, so regenerating on another machine (or in deployment builds) drops it. That brings back the corridor gaps the blocker reported, and the "Done when" browser check would fail after a regeneration elsewhere.

- **V5: The 4× cost is described as a guarantee it does not give.** The parenthetical says the line passes through a room "only where no corridor joins the two places". A 4× weight means the line cuts through a room whenever the corridor detour costs more than four times the straight cut through the room. Within the 40 m window that can happen even when a corridor joins the two places. The prose should state the actual rule rather than an absolute.