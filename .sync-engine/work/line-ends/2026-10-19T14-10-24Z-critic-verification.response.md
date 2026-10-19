## Verdict
Revise

V3-1, V3-2 and V3-3 are all resolved. The V3-2 repair leaves one gap: a walk between two buildings where only one building's floor is traced.

## Findings
- **V3-1: resolved.** When a route starts in an untraced place, its first walk now starts at the open floor nearest it, within 15 m, from which the next place can be reached. So the start is covered as well as the walks into and out of the place, and the start is still marked at its position.
- **V3-2: resolved.** The general fallback now covers only "a walk within one building". Each part of a two-building walk "follows the same rules as a walk within one building", so it is drawn straight on its own when its place is too far from open floor or its floor has no outlines. The 20 m rule decides when the whole walk is drawn straight. Nothing now forces every two-building walk to be straight.
- **V3-3: resolved.** A crossing longer than 20 m means the buildings' open floors do not meet near the connection, and the whole walk is then drawn straight. So a long crossing can no longer cut through rooms. I could not see the plan files, so I cannot confirm that the Fairchild–Stata gap is under 20 m. That remains part of the brief's in-browser check.
- **V4-1 (material, caused by the V3-2 repair): a crossing endpoint is undefined when one building's floor is untraced.** Each building's end of the crossing is defined as "the open floor it can reach there that comes nearest" the other side. When one building's floor has no traced outlines, that building has no open floor, so the contract does not say:
  - where that building's straight part ends and the crossing begins (perhaps at the place itself);
  - what length the 20 m check measures.

  Many buildings on campus are untraced, so this case will come up in practice. Under LE-1 such a walk is supposed to use the traced building's spaces, not to be drawn straight. The contract should say where an untraced building's end of the crossing lies.
- **Other direct regressions: none.**