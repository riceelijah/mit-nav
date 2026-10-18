import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, form, former, reaction, when } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";

const { Wayfinding, Reporting } = concepts;

const PlaceSearch = former(
  "the places matching (text)",
  ({ text }, { place, name, kind, floor }) =>
    form({
      places: each(Wayfinding._search({ text }).is({ place, name, kind, floor })).form({ place, name, kind, floor }),
    }),
);

const ProblemList = former(
  "the open problem reports",
  (_input, { report, reporter, reportedLink, reason, sourceName, destinationName, forward }) =>
    form({
      reports: each(Reporting._open({}).is({ report, reporter, target: reportedLink, reason }))
        .where(Wayfinding._link({ link: reportedLink }).is({ sourceName, destinationName, forward }))
        .form({ report, reporter, link: reportedLink, reason, sourceName, destinationName, forward }),
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
  ({ source, destination, accessibleOnly, hour }, { step, link, instruction, placeName, floor }) =>
    form({
      steps: each(
        Wayfinding._route({ source, destination, accessibleOnly, hour }).is({
          step,
          link,
          instruction,
          placeName,
          floor,
        }),
      ).form({ step, link, instruction, placeName, floor }),
    }),
);

const ShowOverview = endpoint("/map/overview", () =>
  receive({}).then(respond({ problems: ProblemList({}), blocked: BlockedList({}) })),
);

const SearchPlaces = endpoint(
  "/map/search",
  ({ text }) => receive({ text }).then(respond({ places: PlaceSearch({ text }) })),
  { input: { required: ["text"] } },
);

const AddPlace = endpoint(
  "/map/add-place",
  ({ name, kind, floor, place }) =>
    receive({ name, kind, floor })
      .then(Wayfinding.addPlace({ name, kind, floor }).responds({ place }))
      .then(respond({ place })),
  { input: { required: ["name", "kind", "floor"] } },
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
  ({ link, reporter, reason, report }) =>
    receive({ link, reporter, reason })
      .then(Wayfinding.block({ link }).responds({ link }))
      .then(Reporting.report({ reporter, target: link, reason }).responds({ report }))
      .then(respond({ report })),
  { input: { required: ["link", "reporter", "reason"] } },
);

const UnblockLink = endpoint(
  "/problems/unblock",
  ({ link }) =>
    receive({ link })
      .then(Wayfinding.unblock({ link }).responds({ link }))
      .then(respond({ link })),
  { input: { required: ["link"] } },
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
  Browsing: { PlaceSearch, ProblemList, BlockedList, ShowOverview, SearchPlaces },
  Routing: { Route, FindRoute },
  Problems: { BlockLink, UnblockLink, UnblockResolvesReports, ClearingResolvesSharedReports },
  Setup: { AddPlace, Connect },
};
