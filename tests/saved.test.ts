import { expect, test } from "bun:test";
import { AlreadyFavorite, FavoritingConcept, NotFavorite } from "../src/concepts/Favoriting.ts";
import { EmptyTripName, NoSuchTrip, PlanningConcept, TripNameTaken } from "../src/concepts/Planning.ts";
import { InvalidDistance, JournalingConcept } from "../src/concepts/Journaling.ts";
import { PreferringConcept } from "../src/concepts/Preferring.ts";
import { freshApi, freshDb, signedUp } from "./helpers.ts";

test("Favoriting principle: newest first, one each, unfavorite once", async () => {
  const f = new FavoritingConcept((await freshDb()).db);
  await f.favorite({ user: "ana", item: "stata" });
  await Bun.sleep(2);
  await f.favorite({ user: "ana", item: "lab" });
  expect(await f._favorites({ user: "ana" })).toEqual([{ item: "lab" }, { item: "stata" }]);
  expect(await f._favorites({ user: "ben" })).toEqual([]);
  await expect(f.favorite({ user: "ana", item: "lab" })).rejects.toThrow(AlreadyFavorite);
  await f.unfavorite({ user: "ana", item: "stata" });
  expect(await f._favorites({ user: "ana" })).toEqual([{ item: "lab" }]);
  await expect(f.unfavorite({ user: "ana", item: "stata" })).rejects.toThrow(NotFavorite);
  // Ben can favorite the same item; favorites are per person.
  await f.favorite({ user: "ben", item: "lab" });
  expect(await f._favorites({ user: "ben" })).toEqual([{ item: "lab" }]);
});

test("Planning principle: names unique per person, only the owner removes", async () => {
  const p = new PlanningConcept((await freshDb()).db);
  const { trip } = await p.save({ owner: "ana", name: "To lab", source: "w79", destination: "32", accessibleOnly: true });
  expect(await p._trips({ owner: "ana" })).toEqual([{ trip, name: "To lab", source: "w79", destination: "32", accessibleOnly: true }]);
  await expect(p.save({ owner: "ana", name: "To lab", source: "a", destination: "b", accessibleOnly: false })).rejects.toThrow(TripNameTaken);
  await expect(p.save({ owner: "ana", name: "  ", source: "a", destination: "b", accessibleOnly: false })).rejects.toThrow(EmptyTripName);
  await p.save({ owner: "ben", name: "To lab", source: "a", destination: "b", accessibleOnly: false });
  await expect(p.remove({ owner: "ben", trip })).rejects.toThrow(NoSuchTrip);
  expect((await p._trips({ owner: "ana" })).length).toBe(1);
  await p.remove({ owner: "ana", trip });
  expect(await p._trips({ owner: "ana" })).toEqual([]);
  await expect(p.remove({ owner: "ana", trip })).rejects.toThrow(NoSuchTrip);
});

test("Journaling principle: newest first, totals, refuses a negative distance without changing totals", async () => {
  const j = new JournalingConcept((await freshDb()).db);
  expect(await j._totals({ traveller: "ben" })).toEqual({ trips: 0, meters: 0 });
  const { entry: there } = await j.finish({ traveller: "ana", source: "w79", destination: "32", meters: 900 });
  const { entry: back } = await j.finish({ traveller: "ana", source: "32", destination: "w79", meters: 900 });
  expect((await j._history({ traveller: "ana" })).map((e) => e.entry)).toEqual([back, there]);
  expect(await j._totals({ traveller: "ana" })).toEqual({ trips: 2, meters: 1800 });
  await expect(j.finish({ traveller: "ana", source: "a", destination: "b", meters: -1 })).rejects.toThrow(InvalidDistance);
  await expect(j.finish({ traveller: "ana", source: "a", destination: "b", meters: 100_001 })).rejects.toThrow(InvalidDistance);
  expect(await j._totals({ traveller: "ana" })).toEqual({ trips: 2, meters: 1800 });
  expect(await j._history({ traveller: "ben" })).toEqual([]);
});

test("Journaling keeps only the 20 most recent in history, but totals count all", async () => {
  const j = new JournalingConcept((await freshDb()).db);
  for (let i = 0; i < 25; i++) await j.finish({ traveller: "ana", source: "a", destination: "b", meters: 10 });
  expect((await j._history({ traveller: "ana" })).length).toBe(20);
  expect(await j._totals({ traveller: "ana" })).toEqual({ trips: 25, meters: 250 });
});

test("Preferring principle: defaults until set, set overwrites, per person", async () => {
  const p = new PreferringConcept((await freshDb()).db);
  expect(await p._preferences({ user: "ana" })).toEqual({ stepFree: false, useLocation: false, units: "METERS" });
  await p.set({ user: "ana", stepFree: true, useLocation: true, units: "MINUTES" });
  expect(await p._preferences({ user: "ana" })).toEqual({ stepFree: true, useLocation: true, units: "MINUTES" });
  await p.set({ user: "ana", stepFree: false, useLocation: true, units: "FEET" });
  expect(await p._preferences({ user: "ana" })).toEqual({ stepFree: false, useLocation: true, units: "FEET" });
  expect(await p._preferences({ user: "ben" })).toEqual({ stepFree: false, useLocation: false, units: "METERS" });
});

test("saving and finishing trips check their input before anything is kept", async () => {
  const { close, browser, map } = await freshApi();
  const post = await signedUp(browser, "ana");
  const a = (await map.addPlace({ name: "A", kind: "ENTRANCE", floor: 1, latitude: 0, longitude: 0 })).place;
  const trip = { name: "t", source: a, destination: a, accessibleOnly: true };
  expect((await post("/me/trips/save", { ...trip, name: { a: 1 } })).error).toBe("INVALID_REQUEST");
  expect((await post("/me/trips/save", { ...trip, accessibleOnly: "yes" })).error).toBe("INVALID_REQUEST");
  expect((await post("/me/trips/finish", { source: a, destination: a, meters: "lots" })).error).toBe("INVALID_REQUEST");
  // Checks run in order: the input, then the places, then the distance.
  expect((await post("/me/trips/finish", { source: "nope", destination: a, meters: -5 })).error).toBe("NOT_FOUND");
  expect((await post("/me/trips/finish", { source: a, destination: a, meters: 1e308 })).error).toBe("INVALID_REQUEST");
  expect((await post("/me")).trips.trips).toEqual([]);
  expect((await post("/me")).totals.totals).toEqual([{ trips: 0, meters: 0 }]);
  await close();
});
