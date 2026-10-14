import { conceptSet, registerConcept } from "@mit-sdg/sync-engine/assembly";
import wayfindingSpec from "@design/concepts/Wayfinding.md" with { type: "text" };
import reportingSpec from "@design/concepts/Reporting.md" with { type: "text" };
import {
  AlreadyBlocked,
  DuplicatePlace,
  NoSuchLink,
  NoSuchPlace,
  NotBlocked,
  WayfindingConcept,
} from "./concepts/Wayfinding.ts";
import { ReportingConcept } from "./concepts/Reporting.ts";

const wayfinding = registerConcept({
  class: WayfindingConcept,
  spec: wayfindingSpec,
  refusals: {
    DUPLICATE_PLACE: DuplicatePlace,
    NO_SUCH_PLACE: NoSuchPlace,
    NO_SUCH_LINK: NoSuchLink,
    ALREADY_BLOCKED: AlreadyBlocked,
    NOT_BLOCKED: NotBlocked,
  },
});

const reporting = registerConcept({ class: ReportingConcept, spec: reportingSpec });

export const applicationConceptSet = conceptSet({ Wayfinding: wayfinding, Reporting: reporting });
export const { concepts } = applicationConceptSet;
