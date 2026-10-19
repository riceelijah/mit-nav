## Verdict
Approve

## Findings

- **R1: Resolved.** The brief's requirement is now narrowed to safe recovery: rooms the footprint cut off are recovered except corridors, lobbies and bridges, and except outlines that overlap a bounded outline beyond a shared wall. Rooms that fail stay untraced and are drawn approximately. The contract now says the same thing in each part:
  - It keeps the unbounded outline only when that outline passes the area checks.
  - It keeps it only when it overlaps no bounded outline beyond the wall they share.
  - It never keeps it for a corridor, lobby or bridge.
  - It says a cut-off room that fails these "stays untraced and is drawn approximately, as described above".

  Path finding uses only traced corridors, lobbies and bridges plus the two end places' traced outlines. Recovered rooms can never be circulation, so a recovered room can only join a path as one of its end rooms. The drawn line therefore cannot be led outdoors through recovered space.
  - The "Done when" check that the 57/1 and 32/0 counts rise from 12 and 66 has to be confirmed by running the tracing. The contract allows it but cannot guarantee it.

- **Comma: Resolved.** It now reads "...distances are the same. When a route arrives, ..."

- **M1, M2 and M3 are unaffected** and stay resolved. There are no direct regressions.