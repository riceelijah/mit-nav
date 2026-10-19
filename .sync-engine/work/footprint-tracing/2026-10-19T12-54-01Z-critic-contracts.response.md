## Verdict
Approve

## Assessments
The assignment granted no file reads, so this review uses only the Campus.md text, the brief and the task supplied inline. I could not see the previous version of Campus.md, `design/types.md` or the other compositions. I treated the footprint sentence in the floor-plan paragraph as the change, because it is the only text that matches the brief's scope.

**Obligation: footprint-bounded tracing (the local drawing step)**
- **Trigger:** an operator runs the local fit-and-trace step on a fitted drawing.
- **Closing reaction:** no reaction is involved. The step is an operator tool outside the application and owns its whole effect. It writes the floor's outlines, and the converter then adds them to the plan files.
- **Visible success:** the schematic draws traced outlines for lobbies and corridors that used to be thrown away as "outside". This matches the brief's requirement for 100CA, 100CB, 100LA and 100LB on floor 1.
- **False interval:** between a trace and the next converter run, the plan files still hold the earlier outlines. That is acceptable because no endpoint exposes the tracing.
- **Acknowledgement order:** there is no endpoint, so there is nothing to acknowledge.
- **Retry identity:** the building and floor. A rerun "replaces that floor's earlier outlines", so the effect is idempotent per floor, and the owner (the local step) accepts that identity.
- **Recovery:** run the step again. On machines without the local outlines, the converter keeps the outlines already in the plan files ("never drops them"), so a partial or missing local run loses nothing.
- **Duplicate-effect risk:** none, because outlines are replaced and never appended.

**Brief scope coverage**
- The rule "everything beyond the building's outline plus a 1 m margin is closed" is stated directly as "within the building's outline (plus a metre's margin…)".
- The "building filter for the fitting script" and the Building 10 floors 0 and 3–8 PDFs are operator tooling and data. They are implementation staging and need no contract text.
- "No floor loses traced rooms" is an acceptance spot-check in the brief, not behaviour the contract has to promise. The existing area checks and keep-on-regenerate rule are unchanged.
- The brief excludes other tracing rules, and none of them changed: doorway closing, the 0.9 m mark filter, the factor-of-two checks, no tracing of elevators or stairs, and the seated-hall rule.

**Unchanged surfaces (inventory)**
- **Endpoints:** ShowOverview at /map/overview, SearchPlaces at /map/search, FindRoute at /route/find, FindClosest at /route/closest, NearestPlace at /route/nearest, BlockLink at /problems/block and UnblockLink at /problems/unblock. Each module, group and path agrees with its link.
- **Internal reactions:** UnblockResolvesReports and ClearingResolvesSharedReports.
- **Formers:** PlaceSearch, ProblemList, BlockedList, Route, Closest and Nearest.
- **Views:** none.
- **Computations:** none are declared, and the change implies no new derived value or optional-input branch.

The change adds no endpoint, link, reaction or authorization path, and touches no authority, effect owner or acknowledgement ordering.

## Findings
None.

One observation, not a blocker or material finding: the sentence "so open entrance doors never join a lobby to the outdoors" says slightly more than the mechanism guarantees. With the 1 m margin, a lobby's open area can still take in a strip up to 1 m outside an opening that is wider than the roughly 1 m doorways that get closed. In principle, two such openings on the same façade could also join through that strip into one shared area, which is then split by nearest position. The area checks limit the consequence, and the prototype result (56 to 63 rooms on floor 1, all seven lobbies and corridors traced) suggests it is negligible. The wording could say "never joins a lobby to the open outdoors beyond the margin" if precision matters.