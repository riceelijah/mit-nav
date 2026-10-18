import { conceptSet, registerConcept } from "@mit-sdg/sync-engine/assembly";
import type { Db } from "mongodb";
import wayfindingSpec from "@design/concepts/Wayfinding.md" with { type: "text" };
import reportingSpec from "@design/concepts/Reporting.md" with { type: "text" };
import favoritingSpec from "@design/concepts/Favoriting.md" with { type: "text" };
import planningSpec from "@design/concepts/Planning.md" with { type: "text" };
import journalingSpec from "@design/concepts/Journaling.md" with { type: "text" };
import preferringSpec from "@design/concepts/Preferring.md" with { type: "text" };
import {
  AlreadyBlocked,
  DuplicatePlace,
  NoSuchLink,
  NoSuchPlace,
  NotBlocked,
  WayfindingConcept,
} from "./concepts/Wayfinding.ts";
import { ReportingConcept } from "./concepts/Reporting.ts";
import { AlreadyFavorite, FavoritingConcept, NotFavorite } from "./concepts/Favoriting.ts";
import { EmptyTripName, NoSuchTrip, PlanningConcept, TripNameTaken } from "./concepts/Planning.ts";
import { InvalidDistance, JournalingConcept } from "./concepts/Journaling.ts";
import { PreferringConcept } from "./concepts/Preferring.ts";
// Signing in, copied from ConceptBox (github.com/mit-sdg/conceptbox).
import { registering } from "./concepts/Registering/registry.ts";
import { authenticating } from "./concepts/Authenticating/registry.ts";
import { sessioning } from "./concepts/Sessioning/registry.ts";
import { commonsFederating } from "./concepts/Federating/registry.ts";

type Mongo = { database: Db };

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
  floors: { mongo: ({ database }: Mongo) => new WayfindingConcept(database) },
});

const reporting = registerConcept({
  class: ReportingConcept,
  spec: reportingSpec,
  floors: { mongo: ({ database }: Mongo) => new ReportingConcept(database) },
});

const favoriting = registerConcept({
  class: FavoritingConcept,
  spec: favoritingSpec,
  refusals: { ALREADY_FAVORITE: AlreadyFavorite, NOT_FAVORITE: NotFavorite },
  floors: { mongo: ({ database }: Mongo, name: string) => new FavoritingConcept(database, name) },
});

const planning = registerConcept({
  class: PlanningConcept,
  spec: planningSpec,
  refusals: { TRIP_NAME_TAKEN: TripNameTaken, EMPTY_TRIP_NAME: EmptyTripName, NO_SUCH_TRIP: NoSuchTrip },
  floors: { mongo: ({ database }: Mongo, name: string) => new PlanningConcept(database, name) },
});

const journaling = registerConcept({
  class: JournalingConcept,
  spec: journalingSpec,
  refusals: { INVALID_DISTANCE: InvalidDistance },
  floors: { mongo: ({ database }: Mongo, name: string) => new JournalingConcept(database, name) },
});

const preferring = registerConcept({
  class: PreferringConcept,
  spec: preferringSpec,
  floors: { mongo: ({ database }: Mongo, name: string) => new PreferringConcept(database, name) },
});

export const applicationConceptSet = conceptSet({
  Wayfinding: wayfinding,
  Reporting: reporting,
  Registering: registering,
  Authenticating: authenticating,
  Sessioning: sessioning,
  CommonsFederating: commonsFederating,
  Favoriting: favoriting,
  Planning: planning,
  Journaling: journaling,
  Preferring: preferring,
});
export const { concepts } = applicationConceptSet;
