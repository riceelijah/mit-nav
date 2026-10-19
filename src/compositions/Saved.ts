import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, form, former, no, where } from "@mit-sdg/sync-engine/language";
import { preferencesInput, signedIn } from "./inputs.ts";
import { concepts } from "../concepts.ts";

const { Sessioning, Wayfinding, Favoriting, Planning, Journaling, Preferring } = concepts;

// Every endpoint here starts with Sessioning.use, so it only ever reads or changes the caller's own things.

const MyFavorites = former("the favorites of (user)", ({ user }, { item, name, kind, floor }) =>
  form({
    favorites: each(Favoriting._favorites({ user }).is({ item }))
      .where(Wayfinding._place({ place: item }).is({ name, kind, floor }))
      .form({ place: item, name, kind, floor }),
  }),
);

const MyTrips = former("the saved trips of (user)", ({ user }, { trip, name, source, destination, accessibleOnly, sourceName, destinationName }) =>
  form({
    trips: each(Planning._trips({ owner: user }).is({ trip, name, source, destination, accessibleOnly }))
      .where(Wayfinding._place({ place: source }).is({ name: sourceName }), Wayfinding._place({ place: destination }).is({ name: destinationName }))
      .form({ trip, name, source, destination, accessibleOnly, sourceName, destinationName }),
  }),
);

const MyPreferences = former("the preferences of (user)", ({ user }, { stepFree, useLocation, units }) =>
  form({ preferences: each(Preferring._preferences({ user }).is({ stepFree, useLocation, units })).form({ stepFree, useLocation, units }) }),
);

const MyHistory = former("the recent trips of (user)", ({ user }, { entry, source, destination, meters, sourceName, destinationName }) =>
  form({
    history: each(Journaling._history({ traveller: user }).is({ entry, source, destination, meters }))
      .where(Wayfinding._place({ place: source }).is({ name: sourceName }), Wayfinding._place({ place: destination }).is({ name: destinationName }))
      .form({ entry, source, destination, meters, sourceName, destinationName }),
  }),
);

const MyTotals = former("the trip totals of (user)", ({ user }, { trips, meters }) =>
  form({ totals: each(Journaling._totals({ traveller: user }).is({ trips, meters })).form({ trips, meters }) }),
);

const ShowMine = endpoint(
  "/me",
  ({ session, user }) =>
  receive({ session })
    .then(Sessioning.use({ session }).responds({ subject: user }))
    .then(
      respond({
        favorites: MyFavorites({ user }),
        trips: MyTrips({ user }),
        preferences: MyPreferences({ user }),
        history: MyHistory({ user }),
        totals: MyTotals({ user }),
      }),
    ),
  { validators: { input: signedIn() } },
);

const Favorite = endpoint(
  "/me/favorites/add",
  ({ session, user, place }) =>
    receive({ session, place })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(Wayfinding._place({ place }))
          .then(Favoriting.favorite({ user, item: place }).responds({}))
          .then(respond({}))
          .named("known"),
        where(no(Wayfinding._place({ place }))).then(respond({ error: "NO_SUCH_PLACE" })).named("unknown"),
      ),
  { validators: { input: signedIn("place") } },
);

const Unfavorite = endpoint(
  "/me/favorites/remove",
  ({ session, user, place }) =>
    receive({ session, place })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Favoriting.unfavorite({ user, item: place }).responds({}))
      .then(respond({})),
  { validators: { input: signedIn("place") } },
);

const SaveTrip = endpoint(
  "/me/trips/save",
  ({ session, user, name, source, destination, accessibleOnly, trip }) =>
    receive({ session, name, source, destination, accessibleOnly })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(Wayfinding._place({ place: source }), Wayfinding._place({ place: destination }))
          .then(Planning.save({ owner: user, name, source, destination, accessibleOnly }).responds({ trip }))
          .then(respond({ trip }))
          .named("known"),
        where(no(Wayfinding._place({ place: source }))).then(respond({ error: "NO_SUCH_PLACE" })).named("unknown-source"),
        where(no(Wayfinding._place({ place: destination }))).then(respond({ error: "NO_SUCH_PLACE" })).named("unknown-destination"),
      ),
  { validators: { input: signedIn("name", "source", "destination", "accessibleOnly") } },
);

const RemoveTrip = endpoint(
  "/me/trips/remove",
  ({ session, user, trip }) =>
    receive({ session, trip })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Planning.remove({ owner: user, trip }).responds({}))
      .then(respond({})),
  { validators: { input: signedIn("trip") } },
);

const SetPreferences = endpoint(
  "/me/preferences/set",
  ({ session, user, stepFree, useLocation, units }) =>
    receive({ session, stepFree, useLocation, units })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Preferring.set({ user, stepFree, useLocation, units }).responds({}))
      .then(respond({})),
  { validators: { input: preferencesInput } },
);

const FinishTrip = endpoint(
  "/me/trips/finish",
  ({ session, user, source, destination, meters, entry }) =>
    receive({ session, source, destination, meters })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(Wayfinding._place({ place: source }), Wayfinding._place({ place: destination }))
          .then(Journaling.finish({ traveller: user, source, destination, meters }).responds({ entry }))
          .then(respond({ entry }))
          .named("known"),
        where(no(Wayfinding._place({ place: source }))).then(respond({ error: "NO_SUCH_PLACE" })).named("unknown-source"),
        where(no(Wayfinding._place({ place: destination }))).then(respond({ error: "NO_SUCH_PLACE" })).named("unknown-destination"),
      ),
  { validators: { input: signedIn("source", "destination", "meters") } },
);

export const composition = {
  Mine: { MyFavorites, MyTrips, MyPreferences, MyHistory, MyTotals, ShowMine },
  Favorites: { Favorite, Unfavorite },
  Trips: { SaveTrip, RemoveTrip },
  Preferences: { SetPreferences },
  Journal: { FinishTrip },
};
