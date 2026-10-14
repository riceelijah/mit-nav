import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, form, former, reaction, when } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";

const { Wayfinding, Reporting } = concepts;

const Overview = former(
  "the Simmons Hall overview",
  (
    _input,
    { place, name, kind, floor, link, sourceName, destinationName, forward, accessible, blocked, closedFrom, closedUntil, service },
    // Reports are about connections, so the report's target is bound to its own variable.
  ) =>
    form({
      places: each(Wayfinding._places({}).is({ place, name, kind, floor })).form({
        place,
        name,
        kind,
        floor,
      }),
      links: each(
        Wayfinding._links({}).is({ link, sourceName, destinationName, forward, accessible, blocked, closedFrom, closedUntil, service }),
      ).form({ link, sourceName, destinationName, forward, accessible, blocked, closedFrom, closedUntil, service }),
    }),
);

const ProblemList = former(
  "the open problem reports",
  (_input, { report, reporter, reportedLink, reason }) =>
    form({
      reports: each(Reporting._open({}).is({ report, reporter, target: reportedLink, reason })).form({
        report,
        reporter,
        link: reportedLink,
        reason,
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
  receive({}).then(respond({ overview: Overview({}), problems: ProblemList({}) })),
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

export const composition = {
  Browsing: { Overview, ProblemList, ShowOverview },
  Routing: { Route, FindRoute },
  Problems: { BlockLink, UnblockLink, UnblockResolvesReports },
  Setup: { AddPlace, Connect },
};
