Objective: update the authored design for the campus upgrade described in the brief.

- Rename the composition document design/compositions/Simmons.md to design/compositions/Campus.md (composition name Campus; endpoint names Campus.*), and rewrite its prose for a campus of many buildings: outdoor walks between buildings, generated building interiors, Simmons' hand-made map joined at its lobby. Endpoints, paths, and inputs stay the same.
- Update the Wayfinding purpose and principle prose so they are not building-specific. No action, query, state, or refusal changes.
- Update design/types.md instance comments if they mention Simmons.

Acceptance: `bunx --no-install sync-engine check-design design/concepts/*.md design/types.md design/compositions/*.md` passes. Report Status: Complete or Blocked.
