import { assemble } from "@mit-sdg/sync-engine/assembly";
import { composition } from "./compositions/Simmons.ts";
import { WayfindingConcept } from "./concepts/Wayfinding.ts";
import { ReportingConcept } from "./concepts/Reporting.ts";
import { applicationConceptSet } from "./concepts.ts";
import { db } from "./db.ts";

export function assembleApplication(database = db) {
  return assemble({
    conceptSet: applicationConceptSet,
    instances: {
      Wayfinding: new WayfindingConcept(database),
      Reporting: new ReportingConcept(database),
    },
    composition: { Simmons: composition },
    // Print what went wrong. Otherwise a failure only shows up as INTERNAL_ERROR.
    rawFaultReporter: ({ error }) => console.error(error),
  });
}
