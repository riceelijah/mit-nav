## Verdict
Revise

V1 to V5 are all resolved. The fix for V3 directly creates a new problem, R2.

## Findings

- **V1: Resolved.** The brief's Scope now covers what the contract walks through:
  - traced circulation, unlabelled open floor and the two end places, at normal cost;
  - other traced rooms at four times the cost, recovered rooms excluded;
  - the tracing improvements.

  The contract matches this.

- **V2: Resolved.** The plan file marks recovered outlines. The route line passes through a recovered outline only when it is the walk's own start or end. Both the tracing paragraph and the path-finding paragraph say this.

- **V3: Resolved, but it directly causes R2.** Both kinds of unlabelled open floor are now kept only when they are at least 4 m² and do not reach the margin's outer edge. Every traced space and every piece of unlabelled floor is also cut to the building outline without the margin. So a double door can no longer lead a space, or the line, outdoors.

- **V4: Resolved.** On a machine without the local outlines, the converter now keeps each floor's unlabelled open floor and the recovered marks.

- **V5: Resolved.** The prose now states the actual rule: the line goes through a room only where the way round by corridor is more than four times as long as the way through it.

- **R2: Direct regression, recovered outlines may be cut away.** The new final step cuts "every traced space" to the building's outline. A recovered outline is, by definition, the part of a room that lies beyond the outline (for example a basement under a plaza). If the cut applies to recovered outlines, they shrink or vanish. That breaks the requirement that rooms the footprint cut off are recovered, and the "Done when" condition that the 57/1 and 32/0 counts rise from 12 and 66.

  The contract also does not say whether the area checks run before or after the cut. A bounded space that passed the check could then be kept at an area that no longer meets it.

  The contract must say that recovered outlines are exempt from the cut, which is safe because they are walked only as end places. It must also say when the area checks apply relative to the cut.

- **Editorial note, not material:** the sentence about recovered outlines now absorbs the clause "joining each place at the open floor nearest it within 4 metres and searched within 40 metres…". As written, the 4 m join and the 40 m search window read as conditions on recovered outlines rather than on every walk.