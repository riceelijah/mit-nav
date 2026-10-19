import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, form, former, reaction, when, whether } from "@mit-sdg/sync-engine/language";
import { closestInput, floorInput, numbers, signedIn } from "./inputs.ts";
import { concepts } from "../concepts.ts";

const { Wayfinding, Reporting, Registering, Sessioning } = concepts;

const PlaceSearch = former(
  "the places matching (text)",
  ({ text }, { place, name, kind, floor, latitude, longitude }) =>
    form({
      places: each(Wayfinding._search({ text }).is({ place, name, kind, floor, latitude, longitude })).form({ place, name, kind, floor, latitude, longitude }),
    }),
);

const ProblemList = former(
  "the open problem reports",
  (_input, { report, reporter, reportedLink, reason, sourceName, destinationName, forward, username }) =>
    form({
      // whether(...) keeps a report whose reporter has no username (made before accounts), with a null name.
      reports: each(Reporting._open({}).is({ report, reporter, target: reportedLink, reason }))
        .where(
          Wayfinding._link({ link: reportedLink }).is({ sourceName, destinationName, forward }),
          whether(Registering._username({ user: reporter }).is({ username })),
        )
        .form({ report, reporter: username, link: reportedLink, reason, sourceName, destinationName, forward }),
    }),
);

// Every blocked connection, so one blocked without a report (or an elevator ride blocked with its siblings) can still be cleared.
const BlockedList = former(
  "the blocked connections",
  (_input, { link, sourceName, destinationName, forward, service }) =>
    form({
      links: each(Wayfinding._blocked({}).is({ link, sourceName, destinationName, forward, service })).form({
        link,
        sourceName,
        destinationName,
        forward,
        service,
      }),
    }),
);

const Route = former(
  "the route from (source) to (destination)",
  ({ source, destination, accessibleOnly, hour }, { step, link, instruction, placeName, kind, floor, distance, latitude, longitude }) =>
    form({
      steps: each(
        Wayfinding._route({ source, destination, accessibleOnly, hour }).is({
          step,
          link,
          instruction,
          placeName,
          kind,
          floor,
          distance,
          latitude,
          longitude,
        }),
      ).form({ step, link, instruction, placeName, kind, floor, distance, latitude, longitude }),
    }),
);

const ShowOverview = endpoint("/map/overview", () =>
  receive({}).then(respond({ problems: ProblemList({}), blocked: BlockedList({}) })),
);

const FloorPlan = former(
  "the places on floor (floor) of building (building)",
  ({ building, floor }, { place, name, kind, latitude, longitude }) =>
    form({
      places: each(Wayfinding._onFloor({ building, floor }).is({ place, name, kind, latitude, longitude })).form({ place, name, kind, latitude, longitude }),
    }),
);

const ShowFloor = endpoint(
  "/map/floor",
  ({ building, floor }) => receive({ building, floor }).then(respond({ plan: FloorPlan({ building, floor }) })),
  { validators: { input: floorInput } },
);

const SearchPlaces = endpoint(
  "/map/search",
  ({ text }) => receive({ text }).then(respond({ places: PlaceSearch({ text }) })),
  { input: { required: ["text"] } },
);

const AddPlace = endpoint(
  "/map/add-place",
  ({ name, kind, floor, latitude, longitude, place }) =>
    receive({ name, kind, floor, latitude, longitude })
      .then(Wayfinding.addPlace({ name, kind, floor, latitude, longitude }).responds({ place }))
      .then(respond({ place })),
  { input: { required: ["name", "kind", "floor", "latitude", "longitude"] } },
);

const Connect = endpoint(
  "/map/connect",
  ({ source, destination, forward, backward, accessible, closedFrom, closedUntil, service, distance, link }) =>
    receive({ source, destination, forward, backward, accessible, closedFrom, closedUntil, service, distance })
      .then(
        Wayfinding.connect({ source, destination, forward, backward, accessible, closedFrom, closedUntil, service, distance }).responds({ link }),
      )
      .then(respond({ link })),
  { input: { required: ["source", "destination", "forward", "backward", "accessible", "closedFrom", "closedUntil", "service", "distance"] } },
);

const Nearest = former(
  "the building nearest (latitude, longitude)",
  ({ latitude, longitude }, { place, name, placeLatitude, placeLongitude }) =>
    form({
      places: each(Wayfinding._nearest({ latitude, longitude }).is({ place, name, latitude: placeLatitude, longitude: placeLongitude })).form({
        place,
        name,
        latitude: placeLatitude,
        longitude: placeLongitude,
      }),
    }),
);

// A person's position is used only to answer this request; nothing stores it.
const NearestPlace = endpoint(
  "/route/nearest",
  ({ latitude, longitude }) => receive({ latitude, longitude }).then(respond({ nearest: Nearest({ latitude, longitude }) })),
  { validators: { input: numbers("latitude", "longitude") } },
);

const Closest = former(
  "the places matching (text) nearest (source)",
  ({ source, text, accessibleOnly, hour }, { place, name, floor, cost }) =>
    form({
      places: each(Wayfinding._closest({ source, text, accessibleOnly, hour }).is({ place, name, floor, cost })).form({ place, name, floor, cost }),
    }),
);

const FindClosest = endpoint(
  "/route/closest",
  ({ source, text, accessibleOnly, hour }) =>
    receive({ source, text, accessibleOnly, hour }).then(respond({ closest: Closest({ source, text, accessibleOnly, hour }) })),
  { validators: { input: closestInput } },
);

const FindRoute = endpoint(
  "/route/find",
  ({ source, destination, accessibleOnly, hour }) =>
    receive({ source, destination, accessibleOnly, hour }).then(
      respond({ route: Route({ source, destination, accessibleOnly, hour }) }),
    ),
  { input: { required: ["source", "destination", "accessibleOnly", "hour"] } },
);

const BlockLink = endpoint(
  "/problems/block",
  ({ session, user, link, reason, report }) =>
    receive({ session, link, reason })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Wayfinding.block({ link }).responds({ link }))
      .then(Reporting.report({ reporter: user, target: link, reason }).responds({ report }))
      .then(respond({ report })),
  { validators: { input: signedIn("link", "reason") } },
);

const UnblockLink = endpoint(
  "/problems/unblock",
  ({ session, user, link }) =>
    receive({ session, link })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Wayfinding.unblock({ link }).responds({ link }))
      .then(respond({ link })),
  { validators: { input: signedIn("link") } },
);

// Whoever clears a blockage, the reports about it stop being open.
const UnblockResolvesReports = reaction(({ link }) =>
  when(Wayfinding.unblock({}).responds({ link })).then(Reporting.resolve({ target: link })),
);

// Clearing one ride of an elevator clears them all, so the reports on the other rides close too.
const ClearingResolvesSharedReports = reaction(({ link, other }) =>
  when(Wayfinding.unblock({}).responds({ link }))
    .where(Wayfinding._sameService({ link }).is({ other }))
    .then(Reporting.resolve({ target: other })),
);

export const composition = {
  Browsing: { PlaceSearch, ProblemList, BlockedList, FloorPlan, ShowOverview, SearchPlaces, ShowFloor },
  Routing: { Route, FindRoute, Nearest, NearestPlace, Closest, FindClosest },
  Problems: { BlockLink, UnblockLink, UnblockResolvesReports, ClearingResolvesSharedReports },
  Setup: { AddPlace, Connect },
};
