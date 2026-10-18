import { afterEach, beforeEach, expect, test } from "bun:test";
import { AlreadyBlocked, DuplicatePlace, NoSuchPlace, WayfindingConcept } from "../src/concepts/Wayfinding.ts";
import { freshDb } from "./helpers.ts";

let w: WayfindingConcept;
let close: () => Promise<void>;
beforeEach(async () => {
  const t = await freshDb();
  w = new WayfindingConcept(t.db);
  close = t.close;
});
afterEach(() => close());

// Principle: lobby and a second-floor room joined by elevator and stairs.
test("principle: blocked elevator reroutes or removes the step-free route", async () => {
  const { place: lobby } = await w.addPlace({ name: "Lobby", kind: "HALLWAY", floor: 1, latitude: 0, longitude: 0 });
  const { place: room } = await w.addPlace({ name: "Room 215", kind: "ROOM", floor: 2, latitude: 0, longitude: 0 });
  const { link: elevator } = await w.connect({ source: lobby, destination: room, forward: "Take the elevator up.", backward: "Take the elevator down.", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });
  await w.connect({ source: lobby, destination: room, forward: "Take the stairs up.", backward: "Take the stairs down.", accessible: false, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });

  const free = await w._route({ source: lobby, destination: room, accessibleOnly: true, hour: 12 });
  expect(free.map((s) => s.instruction)).toEqual(["Take the elevator up."]);

  await w.block({ link: elevator });
  expect(await w._route({ source: lobby, destination: room, accessibleOnly: true, hour: 12 })).toEqual([]);
  const stairs = await w._route({ source: lobby, destination: room, accessibleOnly: false, hour: 12 });
  expect(stairs.map((s) => s.instruction)).toEqual(["Take the stairs up."]);

  await w.unblock({ link: elevator });
  expect((await w._route({ source: lobby, destination: room, accessibleOnly: true, hour: 12 })).length).toBe(1);
});

test("multi-step routes are numbered and go the right way round", async () => {
  const a = (await w.addPlace({ name: "A", kind: "ENTRANCE", floor: 1, latitude: 0, longitude: 0 })).place;
  const b = (await w.addPlace({ name: "B", kind: "HALLWAY", floor: 1, latitude: 0, longitude: 0 })).place;
  const c = (await w.addPlace({ name: "C", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 })).place;
  await w.connect({ source: a, destination: b, forward: "A to B", backward: "B to A", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });
  await w.connect({ source: b, destination: c, forward: "B to C", backward: "C to B", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });
  const there = await w._route({ source: a, destination: c, accessibleOnly: false, hour: 12 });
  expect(there.map((s) => [s.step, s.instruction, s.placeName])).toEqual([[1, "A to B", "B"], [2, "B to C", "C"]]);
  const back = await w._route({ source: c, destination: a, accessibleOnly: false, hour: 12 });
  expect(back.map((s) => s.instruction)).toEqual(["C to B", "B to A"]);
});

test("refusals", async () => {
  const a = (await w.addPlace({ name: "A", kind: "ENTRANCE", floor: 1, latitude: 0, longitude: 0 })).place;
  await expect(w.addPlace({ name: "A", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 })).rejects.toBeInstanceOf(DuplicatePlace);
  await expect(w.connect({ source: a, destination: "nope", forward: "", backward: "", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 })).rejects.toBeInstanceOf(NoSuchPlace);
  const b = (await w.addPlace({ name: "B", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 })).place;
  const { link } = await w.connect({ source: a, destination: b, forward: "x", backward: "y", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });
  await w.block({ link });
  await expect(w.block({ link })).rejects.toBeInstanceOf(AlreadyBlocked);
});

test("a connection closed overnight is offered by day and hidden between 12am and 6am", async () => {
  const a = (await w.addPlace({ name: "7AB", kind: "HALLWAY", floor: 7, latitude: 0, longitude: 0 })).place;
  const t = (await w.addPlace({ name: "Terrace", kind: "ROOM", floor: 7, latitude: 0, longitude: 0 })).place;
  await w.connect({ source: a, destination: t, forward: "out", backward: "in", accessible: true, closedFrom: 0, closedUntil: 6, service: "", distance: 1 });
  const at = (hour: number) => w._route({ source: a, destination: t, accessibleOnly: false, hour });
  expect((await at(12)).length).toBe(1);
  expect((await at(6)).length).toBe(1);
  expect(await at(0)).toEqual([]);
  expect(await at(5.99)).toEqual([]);
  expect((await at(23.5)).length).toBe(1);
});

test("closing hours may wrap past midnight", async () => {
  const a = (await w.addPlace({ name: "A", kind: "HALLWAY", floor: 1, latitude: 0, longitude: 0 })).place;
  const b = (await w.addPlace({ name: "B", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 })).place;
  await w.connect({ source: a, destination: b, forward: "x", backward: "y", accessible: true, closedFrom: 22, closedUntil: 6, service: "", distance: 1 });
  const at = (hour: number) => w._route({ source: a, destination: b, accessibleOnly: false, hour });
  expect(await at(23)).toEqual([]);
  expect(await at(3)).toEqual([]);
  expect((await at(12)).length).toBe(1);
});

test("blocking one link blocks every link of the same service, and the shorter route wins", async () => {
  const f6 = (await w.addPlace({ name: "6", kind: "HALLWAY", floor: 6, latitude: 0, longitude: 0 })).place;
  const f7 = (await w.addPlace({ name: "7", kind: "HALLWAY", floor: 7, latitude: 0, longitude: 0 })).place;
  const f0 = (await w.addPlace({ name: "0", kind: "HALLWAY", floor: 0, latitude: 0, longitude: 0 })).place;
  const mk = (a: string, b: string, service: string) =>
    w.connect({ source: a, destination: b, forward: "up", backward: "down", accessible: true, closedFrom: 0, closedUntil: 0, service, distance: 3 });
  const { link: l67 } = await mk(f6, f7, "A elevator");
  await mk(f0, f7, "A elevator");
  // Only one link joins 7 and 6.
  const near = await w._route({ source: f7, destination: f6, accessibleOnly: true, hour: 12 });
  expect(near.length).toBe(1);
  await w.block({ link: l67 });
  // The other link shares the service, so the elevator is out everywhere.
  expect(await w._route({ source: f7, destination: f0, accessibleOnly: true, hour: 12 })).toEqual([]);
  await w.unblock({ link: l67 });
  expect((await w._route({ source: f7, destination: f0, accessibleOnly: true, hour: 12 })).length).toBe(1);
});

test("places come back by floor, then in the order they were added", async () => {
  await w.addPlace({ name: "Zebra", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 });
  await w.addPlace({ name: "Upstairs", kind: "ROOM", floor: 2, latitude: 0, longitude: 0 });
  await w.addPlace({ name: "Apple", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 });
  expect((await w._places({})).map((p) => p.name)).toEqual(["Zebra", "Apple", "Upstairs"]);
});

test("a flight of stairs beats waiting for an elevator unless step-free is needed", async () => {
  const a = (await w.addPlace({ name: "1", kind: "HALLWAY", floor: 1, latitude: 0, longitude: 0 })).place;
  const b = (await w.addPlace({ name: "2", kind: "HALLWAY", floor: 2, latitude: 0, longitude: 0 })).place;
  await w.connect({ source: a, destination: b, forward: "elevator", backward: "e", accessible: true, closedFrom: 0, closedUntil: 0, service: "E", distance: 3.5 });
  await w.connect({ source: a, destination: b, forward: "stairs", backward: "s", accessible: false, closedFrom: 0, closedUntil: 0, service: "", distance: 2 });
  expect((await w._route({ source: a, destination: b, accessibleOnly: false, hour: 12 }))[0].instruction).toBe("stairs");
  expect((await w._route({ source: a, destination: b, accessibleOnly: true, hour: 12 }))[0].instruction).toBe("elevator");
});
