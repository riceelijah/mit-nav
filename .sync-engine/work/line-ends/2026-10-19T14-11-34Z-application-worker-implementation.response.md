## Status
Blocked

- Browser testing of Simmons → 32-123 needed: (1) corridors/lobbies the route only passes through drawn without visiting their labels (the line otherwise doubles back into 36-100CB); (2) a walk joins a traced place at the reachable open floor within 4 m and steps to it (vestibule 32-100S1V is closed off by doors); (3) the next walk out of such a place leaves from that open floor; (4) walks may start or end in any traced space, not only corridors; (5) room cost 20 instead of 4 (at 4 the line still cut through lab 184).

## Changed
- web/app.ts, web/indoor.ts

## Questions
- Design change for (1)-(5).

## Checks
- tsc passed; indoor tests pass; browser: line follows corridors in Fairchild and Stata and enters 32-123 by its rear door.
