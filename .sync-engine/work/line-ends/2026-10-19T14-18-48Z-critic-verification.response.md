## Verdict
Revise

The revision covers all five items in the implementation blocker. One of them, the merging of pass-through corridors, introduces a new problem with long corridor runs.

## Findings
- **Blocker items (1)–(5): resolved as written.**
  - (1) A corridor, lobby or bridge the route only passes through is not visited at its position; the walks on either side are drawn as one, and it counts as reached at the corner nearest it.
  - (2) A walk joins a traced place at the reachable open floor within 4 m, then steps to the place's position.
  - (3) The next walk leaves from that same open floor when it cannot leave from the place itself.
  - (4) "The path starts and ends in any traced space."
  - (5) Room cost is twenty, and the explanation in brackets was updated to match.

  None of these changes routes, distances or rerouting: the off-course check still uses the straight lines between places. The rule that a walk into an untraced room ends at the open floor nearest it is unchanged.
- **V6-1 (material, new problem from item 1): merged walks can exceed the 40 m search area.** Merging applies again at every pass-through corridor. A run of several corridors therefore becomes one walk whose two places can be far apart, for example a long run of corridors such as the Infinite Corridor. The path is still "searched within 40 metres around the two places". For places well over 80 m apart, that area does not join them. "no such path joins them" then applies, and the whole merged run is drawn straight. Before this change, each corridor-to-corridor walk was drawn along open floor, so this is a regression wherever the route follows a long corridor. The search area for a merged walk needs to cover the corridors it passes through, or merging needs a limit.
- **V6-2 (minor): merging across two buildings is not explicit.** The merge applies to a corridor "between two places on its floor". The case that motivated item 1 is 36-100CB, between a Fairchild corridor and Stata's lobby, so the merged walk is a two-building walk. The contract does not say whether "its floor" includes the other building's floor with the same floor number. It also does not say that the merged walk is then drawn in three parts. The implementation evidently does both; the contract should say so.
- **Other direct regressions: none.**