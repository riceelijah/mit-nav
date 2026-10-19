import { expect, test } from "bun:test";
import { freshApi, signedUp } from "./helpers.ts";

const open = { closedFrom: 0, closedUntil: 0, service: "", distance: 1 };

async function smallMap(post: (path: string, body?: object) => Promise<any>) {
  const lobby = (await post("/map/add-place", { name: "Lobby", kind: "ENTRANCE", floor: 1, latitude: 0, longitude: 0 })).place;
  const room = (await post("/map/add-place", { name: "Room 215", kind: "ROOM", floor: 2, latitude: 0, longitude: 0 })).place;
  const elevator = (await post("/map/connect", { source: lobby, destination: room, forward: "Elevator up", backward: "Elevator down", accessible: true, ...open })).link;
  await post("/map/connect", { source: lobby, destination: room, forward: "Stairs up", backward: "Stairs down", accessible: false, ...open });
  return { lobby, room, elevator };
}

// Core user journey, end to end through the HTTP API with an empty database.
test("journey: route without an account, sign up, flag the elevator, reroute, someone else clears it", async () => {
  const { close, browser } = await freshApi();
  const visitor = browser();
  const { lobby, room, elevator } = await smallMap(visitor);

  const route = (acc: boolean) => visitor("/route/find", { source: lobby, destination: room, accessibleOnly: acc, hour: 12 });
  const steps = (await route(true)).route.steps;
  expect(steps.map((s: any) => [s.instruction, s.distance])).toEqual([["Elevator up", 1]]);

  // Flagging needs an account; the refusal changes nothing.
  expect((await visitor("/problems/block", { link: elevator, reason: "Out of service" })).error).toBe("UNAUTHORIZED");
  expect((await route(true)).route.steps.length).toBe(1);

  const iris = await signedUp(browser, "iris");
  expect((await iris("/auth/me")).username).toBe("iris");
  expect((await iris("/problems/block", { link: elevator, reason: "Out of service" })).report).toBeTruthy();
  expect((await route(true)).route.steps).toEqual([]);
  expect((await route(false)).route.steps.map((s: any) => s.instruction)).toEqual(["Stairs up"]);

  // The report shows the account's username, never a name typed into the request.
  const overview = await visitor("/map/overview");
  expect(overview.problems.reports.map((r: any) => [r.reporter, r.reason, r.sourceName, r.forward])).toEqual([["iris", "Out of service", "Lobby", "Elevator up"]]);
  expect(overview.blocked.links.map((l: any) => l.link)).toEqual([elevator]);

  const bo = await signedUp(browser, "bob");
  expect((await bo("/problems/block", { link: elevator, reason: "dup" })).error).toBe("CONFLICT");
  expect((await visitor("/problems/unblock", { link: elevator })).error).toBe("UNAUTHORIZED");
  await bo("/problems/unblock", { link: elevator });
  expect((await route(true)).route.steps.length).toBe(1);
  expect((await visitor("/map/overview")).problems.reports).toEqual([]);
  await close();
});

test("sign-in: wrong password, sign out ends the session, username taken", async () => {
  const { close, browser } = await freshApi();
  const ana = await signedUp(browser, "ana");
  const other = browser();
  expect((await other("/auth/login", { username: "ana", password: "wrong password!" })).error).toBe("UNAUTHORIZED");
  expect((await other("/auth/register", { username: "ana", password: "another good one" })).error).toBe("CONFLICT");
  expect((await other("/auth/login", { username: "ana", password: "correct horse battery" })).user).toBeTruthy();
  await ana("/auth/logout");
  expect((await ana("/auth/me")).error).toBe("UNAUTHORIZED");
  expect((await other("/auth/me")).username).toBe("ana");
  await close();
});

test("saved things: favorites, trips, preferences, journal; each person sees and changes only their own", async () => {
  const { close, browser } = await freshApi();
  const { lobby, room } = await smallMap(browser());
  const ana = await signedUp(browser, "ana");
  const ben = await signedUp(browser, "ben");

  await ana("/me/favorites/add", { place: room });
  expect((await ana("/me/favorites/add", { place: room })).error).toBe("CONFLICT");
  expect((await ana("/me/favorites/add", { place: "nowhere" })).error).toBe("NOT_FOUND");
  const { trip } = await ana("/me/trips/save", { name: "To class", source: lobby, destination: room, accessibleOnly: true });
  expect((await ana("/me/trips/save", { name: "To class", source: lobby, destination: room, accessibleOnly: false })).error).toBe("CONFLICT");
  expect((await ana("/me/trips/save", { name: " ", source: lobby, destination: room, accessibleOnly: false })).error).toBe("INVALID_REQUEST");
  await ana("/me/preferences/set", { stepFree: true, useLocation: false, units: "MINUTES" });
  expect((await ana("/me/preferences/set", { stepFree: true, useLocation: false, units: "FURLONGS" })).error).toBe("INVALID_REQUEST");
  await ana("/me/trips/finish", { source: lobby, destination: room, meters: 120 });
  await ana("/me/trips/finish", { source: room, destination: lobby, meters: 80 });
  expect((await ana("/me/trips/finish", { source: lobby, destination: room, meters: -5 })).error).toBe("INVALID_REQUEST");

  const mine = await ana("/me");
  expect(mine.favorites.favorites.map((f: any) => f.name)).toEqual(["Room 215"]);
  expect(mine.trips.trips.map((t: any) => [t.name, t.sourceName, t.destinationName, t.accessibleOnly])).toEqual([["To class", "Lobby", "Room 215", true]]);
  expect(mine.preferences.preferences).toEqual([{ stepFree: true, useLocation: false, units: "MINUTES" }]);
  expect(mine.history.history.map((h: any) => [h.sourceName, h.meters])).toEqual([["Room 215", 80], ["Lobby", 120]]);
  expect(mine.totals.totals).toEqual([{ trips: 2, meters: 200 }]);

  // Ben sees none of it and cannot remove Ana's trip; the refusal is the same as for a missing trip.
  const his = await ben("/me");
  expect([his.favorites.favorites, his.trips.trips, his.history.history]).toEqual([[], [], []]);
  expect(his.preferences.preferences).toEqual([{ stepFree: false, useLocation: false, units: "METERS" }]);
  expect(his.totals.totals).toEqual([{ trips: 0, meters: 0 }]);
  expect((await ben("/me/trips/remove", { trip })).error).toBe("NOT_FOUND");
  expect((await ana("/me")).trips.trips.length).toBe(1);

  // Without an account, every one of these is refused.
  const visitor = browser();
  expect((await visitor("/me")).error).toBe("UNAUTHORIZED");
  expect((await visitor("/me/favorites/add", { place: room })).error).toBe("UNAUTHORIZED");

  await ana("/me/favorites/remove", { place: room });
  expect((await ana("/me/favorites/remove", { place: room })).error).toBe("NOT_FOUND");
  await ana("/me/trips/remove", { trip });
  expect((await ana("/me")).trips.trips).toEqual([]);
  await close();
});
