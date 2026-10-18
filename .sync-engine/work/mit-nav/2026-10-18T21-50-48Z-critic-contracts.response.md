## Verdict
Revise

The changed set is consistent on scope, naming, links and endpoint paths. Every `Campus.*` endpoint link has exactly one matching `endpoints` entry, the module, group and declaration names agree, and `UnblockResolvesReports` is correctly internal with no path. The new elevator prose puts one service under each elevator, so flagging one ride takes the whole elevator out. That rule interacts with the BlockLink and UnblockLink flows in ways the composition does not settle, so the verdict is Revise rather than Approve.

Limitation: I did not have the prior `Simmons.md` or the prior Wayfinding text, so I could not diff them to confirm that "no contract behavior changed unintentionally". See M-6.

## Findings

- **M-1: BlockLink ordering, refusal and partial failure are unspecified across two owners.** State the order of `block` and `report`; that a refused `block` (NO_SUCH_LINK, ALREADY_BLOCKED) records no report, or that it does; the visible refusals with their codes; recovery when the link is blocked but the report is lost.
- **M-2: Whole-elevator blocking is not carried through to reports.** Unblocking ride B clears ride A as well, but UnblockResolvesReports resolves only reports about B, so reports filed against A stay OPEN. A second visitor flagging another ride of an elevator already out gets ALREADY_BLOCKED; the composition doesn't say whether their report is kept. Either resolve reports for every link sharing the service, or say reports stay per-ride and explain how they are cleared. `_links` returns the service.
- **M-3: Setup endpoints have no stated authorization.** Say explicitly they are open to anyone in this version, or name an enforcement point.
- **M-4: Endpoint contracts lack inputs, answers and refusal codes.** FindRoute, BlockLink, UnblockLink, AddPlace and Connect don't say what the caller supplies, what comes back, or which refusal codes are visible; FindRoute should say whether "no route" is an empty answer or a refusal.
- **M-5: Campus-scale ordering of `_places`.** Ordering by floor then insertion interleaves every building's floors; state the intended ordering in the composition or accept the interleaving for the picker.
- **M-6: Context needed for the regression check.** The prior Simmons.md and Wayfinding prose were not supplied; M-1, M-3 and M-4 may be pre-existing. M-2 is new behavior either way.
