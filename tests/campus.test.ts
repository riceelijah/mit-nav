import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { WayfindingConcept } from "../src/concepts/Wayfinding.ts";
import { interior, parseCsv, parseFloor } from "../scripts/campus-to-map.ts";
import { freshApi, freshDb, signedUp } from "./helpers.ts";

const csv = `"FLOOR","ROOM NUMBER","SQ FT","ROOM USE","DEPARTMENT","MAJOR USE"
"1","9-100CA","1,043","CORRIDOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-100E1","62","ELEVATOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-100SA","188","STAIRWAY","DP OF FACILITIES","CIRCULATION AREA"
"","9-123","3,550","LECTURE HALL","REGISTRAR","CLASSROOMS"
"","9-124Z","40","SHAFT SPACE","DP OF FACILITIES","MECHANICAL AREA"
"SUBTOTAL","","4,883","","",""
"2","9-200E1","62","ELEVATOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-200SA","188","STAIRWAY","DP OF FACILITIES","CIRCULATION AREA"
"","9-201","200","OFFICE","EECS","OFFICES"
"D4","9-D400E1","62","ELEVATOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-D400SA","188","STAIRWAY","DP OF FACILITIES","CIRCULATION AREA"`;

test("converter: room list becomes floors, one elevator service, stairs and rooms", () => {
  expect(parseFloor("D4")).toEqual({ tower: "D", digits: "4", level: 4 });
  expect(parseFloor("ROOF")).toBeUndefined();
  expect(parseCsv(csv)[0]["SQ FT"]).toBe("1,043");

  const plan = interior("9", csv);
  expect(plan.places.filter((p) => p.kind === "TRANSIT").map((p) => p.name)).toEqual([
    "Building 9, floor 1", "Building 9, floor 2", "Building 9, floor D4",
  ]);
  // Closets and shafts are not destinations.
  expect(plan.places.filter((p) => p.kind === "ROOM").map((p) => p.name)).toEqual(["9-123 Lecture Hall", "9-201 Office"]);
  const elevator = plan.links.filter((l) => l[7] === "Building 9 elevator E1");
  expect(elevator.map((l) => [l[0], l[1]])).toEqual([
    ["Building 9, floor 1", "Building 9, floor 2"],
    ["Building 9, floor 1", "Building 9, floor D4"],
    ["Building 9, floor 2", "Building 9, floor D4"],
  ]);
  // Stair SA on floors 1 and 2 is one flight; the D tower's SA is a different stair.
  const stairs = plan.links.filter((l) => l[2].includes("stairway"));
  expect(stairs.map((l) => [l[0], l[1], l[4]])).toEqual([["Building 9, floor 1", "Building 9, floor 2", false]]);
  expect(plan.ground?.code).toBe("1");
});

test("_sameService answers the other rides of an elevator, and nothing for an unshared link", async () => {
  const { db, close } = await freshDb();
  const w = new WayfindingConcept(db);
  const [a, b, c] = await Promise.all(["A", "B", "C"].map(async (name, floor) => (await w.addPlace({ name, kind: "HALLWAY", floor, latitude: 0, longitude: 0 })).place));
  const base = { forward: "up", backward: "down", accessible: true, closedFrom: 0, closedUntil: 0, distance: 1 };
  const ab = (await w.connect({ source: a, destination: b, ...base, service: "lift" })).link;
  const bc = (await w.connect({ source: b, destination: c, ...base, service: "lift" })).link;
  const walk = (await w.connect({ source: a, destination: c, ...base, service: "" })).link;
  expect(await w._sameService({ link: ab })).toEqual([{ other: bc }]);
  expect(await w._sameService({ link: walk })).toEqual([]);
  expect(await w._sameService({ link: "nope" })).toEqual([]);
  await close();
});

test("clearing one ride of an elevator resolves the reports on its other rides", async () => {
  const { close, browser } = await freshApi();
  const post = await signedUp(browser, "ana");
  const floor = async (n: number) => (await post("/map/add-place", { name: `Floor ${n}`, kind: "HALLWAY", floor: n, latitude: 0, longitude: 0 })).place;
  const [one, two, three] = [await floor(1), await floor(2), await floor(3)];
  const ride = async (source: string, destination: string) =>
    (await post("/map/connect", { source, destination, forward: "up", backward: "down", accessible: true, closedFrom: 0, closedUntil: 0, service: "E1", distance: 1 })).link;
  const low = await ride(one, two);
  const high = await ride(two, three);

  expect((await post("/problems/block", { link: low, reason: "Doors stuck" })).report).toBeTruthy();
  // The whole elevator is out, so a second flag on another ride is refused and records nothing.
  expect((await post("/problems/block", { link: high, reason: "Same" })).error).toBe("CONFLICT");
  expect((await post("/map/overview", {})).problems.reports.length).toBe(1);

  await post("/problems/unblock", { link: high });
  const overview = await post("/map/overview", {});
  expect(overview.problems.reports).toEqual([]);
  expect(overview.blocked.links).toEqual([]);
  await close();
});

test("campus map: Simmons Hall to a Stata 9th-floor lab walks along outdoor paths and up a Stata elevator, and around a flagged one", async () => {
  const { db, close } = await freshDb();
  const w = new WayfindingConcept(db);
  const maps = ["campus.json"].map((f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8")));
  const ids = new Map<string, string>();
  for (const p of maps.flatMap((m) => m.places)) ids.set(p.name, (await w.addPlace({ latitude: 0, longitude: 0, ...p })).place);
  for (const [s, d, forward, backward, accessible, closedFrom, closedUntil, service, distance] of maps.flatMap((m) => m.links)) {
    await w.connect({ source: ids.get(s)!, destination: ids.get(d)!, forward, backward, accessible, closedFrom, closedUntil, service, distance });
  }

  const route = () => w._route({ source: ids.get("Simmons Hall (Building W79)")!, destination: ids.get("32-G904 Research Lab")!, accessibleOnly: true, hour: 12 });
  const started = performance.now();
  const steps = await route();
  expect(performance.now() - started).toBeLessThan(2000);
  const said = steps.map((s) => s.instruction);
  expect(said.some((s) => / m outside/.test(s))).toBe(true);
  expect(said.some((s) => /stair/i.test(s))).toBe(false);
  const lift = steps.find((s) => /elevator E\d+ and take it/.test(s.instruction))!;
  expect(lift).toBeTruthy();

  await w.block({ link: lift.link });
  const around = await route();
  expect(around.length).toBeGreaterThan(0);
  expect(around.some((s) => s.link === lift.link)).toBe(false);
  await close();
}, 60_000);

test("search: entrances first, natural number order, transit hidden, at most 40", async () => {
  const { db, close } = await freshDb();
  const w = new WayfindingConcept(db);
  for (const [name, kind] of [["32-G904 Research Lab", "ROOM"], ["Building 32 (Stata Center)", "ENTRANCE"], ["Building 32, floor 1", "TRANSIT"], ["32-123 Lecture Hall", "ROOM"], ["2-105 Classroom", "ROOM"], ["10-250 Lecture Hall", "ROOM"]] as const) {
    await w.addPlace({ name, kind, floor: 1, latitude: 0, longitude: 0 });
  }
  expect((await w._search({ text: "32" })).map((p) => p.name)).toEqual(["Building 32 (Stata Center)", "32-123 Lecture Hall", "32-G904 Research Lab"]);
  expect((await w._search({ text: "LECTURE" })).map((p) => p.name)).toEqual(["10-250 Lecture Hall", "32-123 Lecture Hall"]);
  expect((await w._search({ text: "" })).map((p) => p.name)).toEqual(["Building 32 (Stata Center)", "2-105 Classroom", "10-250 Lecture Hall", "32-123 Lecture Hall", "32-G904 Research Lab"]);
  expect(await w._search({ text: "nowhere" })).toEqual([]);
  for (let i = 0; i < 45; i++) await w.addPlace({ name: `Room ${i}`, kind: "ROOM", floor: 1 });
  expect((await w._search({ text: "room" })).length).toBe(40);
  await close();
});

test("_link and _blocked describe connections; a blocked connection without a report can still be found and cleared", async () => {
  const { db, close } = await freshDb();
  const w = new WayfindingConcept(db);
  const a = (await w.addPlace({ name: "A", kind: "HALLWAY", floor: 1, latitude: 0, longitude: 0 })).place;
  const b = (await w.addPlace({ name: "B", kind: "HALLWAY", floor: 2, latitude: 0, longitude: 0 })).place;
  const base = { accessible: true, closedFrom: 0, closedUntil: 0, distance: 1 };
  const one = (await w.connect({ source: a, destination: b, forward: "Ride up", backward: "Ride down", ...base, service: "E1" })).link;
  const two = (await w.connect({ source: a, destination: b, forward: "Ride up again", backward: "down", ...base, service: "E1" })).link;
  expect(await w._link({ link: one })).toEqual([{ sourceName: "A", destinationName: "B", forward: "Ride up", service: "E1" }]);
  expect(await w._link({ link: "nope" })).toEqual([]);
  expect(await w._blocked({})).toEqual([]);
  // Blocking straight through the concept leaves no report; both rides still show up as blocked.
  await w.block({ link: one });
  expect((await w._blocked({})).map((l) => [l.link, l.forward])).toEqual([[one, "Ride up"], [two, "Ride up again"]]);
  await w.unblock({ link: two });
  expect(await w._blocked({})).toEqual([]);
  await close();
});

test("search endpoint answers matches, and an empty list when nothing matches", async () => {
  const { close, browser } = await freshApi();
  const post = browser();
  await post("/map/add-place", { name: "32-123 Lecture Hall", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 });
  expect((await post("/map/search", { text: "32-1" })).places.places.map((p: any) => p.name)).toEqual(["32-123 Lecture Hall"]);
  expect((await post("/map/search", { text: "zzz" })).places.places).toEqual([]);
  expect((await post("/map/search", {})).error).toBeTruthy();
  await close();
});

test("_nearest: closest building by ground distance, earliest on a tie, nothing without positions or off Earth", async () => {
  const { db } = await freshDb();
  const w = new WayfindingConcept(db);
  expect(await w._nearest({ latitude: 42.36, longitude: -71.09 })).toEqual([]);
  // Rooms and places without a position never answer.
  await w.addPlace({ name: "32-123 Lecture Hall", kind: "ROOM", floor: 1, latitude: 42.3616, longitude: -71.0906 });
  await w.addPlace({ name: "Nowhere", kind: "ENTRANCE", floor: 1, latitude: 0, longitude: 0 });
  expect(await w._nearest({ latitude: 42.36, longitude: -71.09 })).toEqual([]);
  // B is 0.0010 degrees east (about 82 m); C is 0.0009 degrees north (about 100 m): east wins on the ground, though not in degrees.
  const a = await w.addPlace({ name: "Far", kind: "ENTRANCE", floor: 1, latitude: 42.37, longitude: -71.09 });
  const b = await w.addPlace({ name: "East", kind: "ENTRANCE", floor: 1, latitude: 42.36, longitude: -71.089 });
  await w.addPlace({ name: "North", kind: "ENTRANCE", floor: 1, latitude: 42.3609, longitude: -71.09 });
  expect((await w._nearest({ latitude: 42.36, longitude: -71.09 })).map((p) => p.name)).toEqual(["East"]);
  await w.addPlace({ name: "East again", kind: "ENTRANCE", floor: 1, latitude: 42.36, longitude: -71.089 });
  expect((await w._nearest({ latitude: 42.36, longitude: -71.09 }))[0].place).toBe(b.place);
  expect(await w._nearest({ latitude: 91, longitude: 0 })).toEqual([]);
  expect(a.place).toBeTruthy();
});

test("route steps carry the kind and position of the place they reach; nearest endpoint refuses non-numbers", async () => {
  const { close, browser } = await freshApi();
  const post = browser();
  const at = { latitude: 42.36, longitude: -71.09 };
  const out = (await post("/map/add-place", { name: "Building A", kind: "ENTRANCE", floor: 1, ...at })).place;
  const hall = (await post("/map/add-place", { name: "Building A, floor 1", kind: "TRANSIT", floor: 1, ...at })).place;
  await post("/map/connect", { source: out, destination: hall, forward: "Go in", backward: "Out", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });
  const steps = (await post("/route/find", { source: hall, destination: out, accessibleOnly: false, hour: 12 })).route.steps;
  expect(steps.map((s: any) => [s.kind, s.latitude, s.longitude])).toEqual([["ENTRANCE", 42.36, -71.09]]);
  expect((await post("/map/search", { text: "Building A" })).places.places[0].latitude).toBe(42.36);
  expect((await post("/route/nearest", { latitude: 42.3601, longitude: -71.0901 })).nearest.places.map((p: any) => p.name)).toEqual(["Building A"]);
  expect((await post("/route/nearest", { latitude: "north", longitude: -71.09 })).error).toBe("INVALID_REQUEST");
  await close();
});

test("_onFloor answers the building's positioned places on that floor only", async () => {
  const { db } = await freshDb();
  const w = new WayfindingConcept(db);
  const at = { latitude: 42.36, longitude: -71.09 };
  await w.addPlace({ name: "32-123 Lecture Hall", kind: "ROOM", floor: 1, ...at });
  await w.addPlace({ name: "32-100LA Lobby", kind: "TRANSIT", floor: 1, ...at });
  await w.addPlace({ name: "32-201 Office", kind: "ROOM", floor: 2, ...at });
  await w.addPlace({ name: "3-101 Office", kind: "ROOM", floor: 1, ...at });
  await w.addPlace({ name: "32-150 Office", kind: "ROOM", floor: 1, latitude: 0, longitude: 0 });
  await w.addPlace({ name: "Building 32, floor 1", kind: "TRANSIT", floor: 1, ...at });
  expect((await w._onFloor({ building: "32", floor: 1 })).map((p) => [p.name, p.kind])).toEqual([["32-123 Lecture Hall", "ROOM"], ["32-100LA Lobby", "TRANSIT"]]);
  expect(await w._onFloor({ building: "99", floor: 1 })).toEqual([]);
});

test("floor endpoint answers places and refuses a floor that is not a number", async () => {
  const { close, browser } = await freshApi();
  const post = browser();
  await post("/map/add-place", { name: "32-123 Lecture Hall", kind: "ROOM", floor: 1, latitude: 42.36, longitude: -71.09 });
  expect((await post("/map/floor", { building: "32", floor: 1 })).plan.places.map((p: any) => p.name)).toEqual(["32-123 Lecture Hall"]);
  expect((await post("/map/floor", { building: "32", floor: "one" })).error).toBe("INVALID_REQUEST");
  await close();
});

test("_closest: nearest matches by route cost, step-free respected, never the start or transit, at most 5", async () => {
  const { db } = await freshDb();
  const w = new WayfindingConcept(db);
  const at = { latitude: 0, longitude: 0 };
  const add = async (name: string, kind: "ROOM" | "TRANSIT" | "HALLWAY" = "ROOM") => (await w.addPlace({ name, kind, floor: 1, ...at })).place;
  const hall = await add("Hall", "HALLWAY");
  const near = await add("1-101 Male Lavatory");
  const far = await add("1-301 Female Lavatory");
  const corridor = await add("1-100CA Lavatory corridor", "TRANSIT");
  const up = await add("Up", "HALLWAY");
  const link = (a: string, b: string, distance: number, accessible = true) =>
    w.connect({ source: a, destination: b, forward: "go", backward: "back", accessible, closedFrom: 0, closedUntil: 0, service: "", distance });
  await link(hall, near, 1);
  await link(hall, corridor, 0.5);
  await link(hall, up, 1, false); // stairs
  await link(up, far, 1);
  expect((await w._closest({ source: hall, text: "lavatory", accessibleOnly: false, hour: 12 })).map((c) => [c.name, c.cost])).toEqual([["1-101 Male Lavatory", 1], ["1-301 Female Lavatory", 2]]);
  expect((await w._closest({ source: hall, text: "lavatory", accessibleOnly: true, hour: 12 })).map((c) => c.name)).toEqual(["1-101 Male Lavatory"]);
  expect(await w._closest({ source: near, text: "male lavatory", accessibleOnly: false, hour: 12 }).then((r) => r.map((c) => c.name))).toEqual(["1-301 Female Lavatory"]);
  expect(await w._closest({ source: "nowhere", text: "lavatory", accessibleOnly: false, hour: 12 })).toEqual([]);
  for (let i = 0; i < 7; i++) await link(hall, await add(`2-10${i} Public Lavatory`), 3 + i);
  expect((await w._closest({ source: hall, text: "lavatory", accessibleOnly: false, hour: 12 })).length).toBe(5);
});

test("closest endpoint answers matches and refuses a missing flag", async () => {
  const { close, browser } = await freshApi();
  const post = browser();
  const at = { latitude: 0, longitude: 0, floor: 1 };
  const a = (await post("/map/add-place", { name: "A", kind: "HALLWAY", ...at })).place;
  const b = (await post("/map/add-place", { name: "1-101 Male Lavatory", kind: "ROOM", ...at })).place;
  await post("/map/connect", { source: a, destination: b, forward: "go", backward: "back", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });
  expect((await post("/route/closest", { source: a, text: "Lavatory", accessibleOnly: false, hour: 12 })).closest.places.map((p: any) => p.name)).toEqual(["1-101 Male Lavatory"]);
  expect((await post("/route/closest", { source: a, text: "Lavatory", hour: 12 })).error).toBe("INVALID_REQUEST");
  await close();
});
