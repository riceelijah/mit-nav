import { expect, test } from "bun:test";
import { floorJoin, interior, tracedMeeting, parseFloor, pathNetwork, withMisreadings, type Located, type Point } from "../scripts/campus-to-map.ts";

// Positions are metres on a local grid (x east, y north), as the converter uses after converting lat/long.
const csv = `"FLOOR","ROOM NUMBER","SQ FT","ROOM USE","DEPARTMENT","MAJOR USE"
"1","9-100CA","500","CORRIDOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-100CB","500","CORRIDOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-100LA","500","LOBBY","DP OF FACILITIES","CIRCULATION AREA"
"","9-100E1","62","ELEVATOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-100E2","62","ELEVATOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-123","3,550","LECTURE HALL","REGISTRAR","CLASSROOMS"
"","9-150","200","OFFICE","EECS","OFFICES"
"2","9-200E1","62","ELEVATOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-200E2","62","ELEVATOR","DP OF FACILITIES","CIRCULATION AREA"
"","9-201","200","OFFICE","EECS","OFFICES"`;

const at = (floor: string, x: number, y: number) => ({ floor, at: [x, y] as Point });
const located: Located = new Map([
  ["100CA", at("1", 0, 0)],
  ["100CB", at("1", 30, 0)],
  ["100LA", at("1", 200, 0)], // far from the others: joined only because nothing nearer joins it
  ["100E1", at("1", 2, 0)],
  ["100E2", at("1", 198, 0)],
  ["123", at("1", 33, 4)],
  ["200E1", at("2", 2, 0)],
  ["200E2", at("2", 198, 0)],
  ["201", at("2", 0, 0)],
]);

test("converter: corridors are linked by distance, and rooms and elevators attach to the nearest corridor", () => {
  const plan = interior("9", csv, located);
  const walks = plan.links.filter((l) => l[2].includes("along the corridor")).map((l) => [l[0], l[1], l[2]]);
  expect(walks).toEqual([
    ["9-100CA Corridor", "9-100CB Corridor", "Walk about 30 m along the corridor."],
    ["9-100CB Corridor", "9-100LA Lobby", "Walk about 170 m along the corridor."],
  ]);
  const hall = plan.links.find((l) => l[1] === "9-123 Lecture Hall")!;
  expect([hall[0], hall[2]]).toEqual(["9-100CB Corridor", "Walk about 5 m to 9-123 (lecture hall)."]);
  // A room without a position attaches to the corridor nearest the middle of the floor's corridors, and takes its position.
  const office = plan.links.find((l) => l[1] === "9-150 Office")!;
  expect(office[0]).toBe("9-100CB Corridor");
  expect(plan.places.find((p) => p.name === "9-150 Office")!.at).toEqual([30, 0]);
  // Plans draw every positioned room, closets included, with its area from square feet (3,550 sq ft is about 330 m²).
  expect(plan.drawn.find((r) => r.number === "123")).toMatchObject({ use: "LECTURE HALL", area: 330, code: "1" });
  expect(plan.drawn.map((r) => r.number)).toContain("100E1");
  // Elevator E2 is reached from the lobby beside it, so it costs less than E1 for a trip that starts there.
  const e1 = plan.links.find((l) => l[7] === "Building 9 elevator E1")!;
  const e2 = plan.links.find((l) => l[7] === "Building 9 elevator E2")!;
  expect([e1[0], e1[2]]).toEqual(["9-100CA Corridor", "Walk about 2 m to elevator E1 and take it up to floor 2."]);
  expect(e2[0]).toBe("9-100LA Lobby");
  // Floor 2 has no corridor positions, so it is a single corridor.
  expect(e1[1]).toBe("Building 9, floor 2");
  expect(plan.floors.get("2")!.hub).toBe(true);
});

test("converter: buildings join where corridors meet, where both reach the shared wall, or (without positions) where outlines touch", () => {
  const square = (x0: number, x1: number): Point[][] => [[[x0, 0], [x1, 0], [x1, 50], [x0, 50], [x0, 0]]];
  const a = { rings: square(0, 100), center: [50, 25] as Point };
  const b = { rings: square(100, 200), center: [150, 25] as Point };
  const floor = (code: string, corridors: [string, number][]) => ({ code, level: 1, hub: false, corridors: corridors.map(([name, x]) => ({ name, at: [x, 25] as Point })) });
  const attach = (corridors: { corridor: { name: string; at: Point | undefined } }) => () => corridors;
  const none = attach({ corridor: { name: "unused", at: undefined } });

  // Corridors 30 m and 20 m from the shared wall at x = 100: both reach it, so the buildings join between them.
  expect(floorJoin(floor("1", [["A1", 70]]), floor("1", [["B1", 120]]), true, a, b, none, none)?.map((x) => (typeof x === "number" ? x : x.name))).toEqual(["A1", "B1", 50]);
  // One side's nearest corridor is 60 m from the wall: no join.
  expect(floorJoin(floor("1", [["A1", 40]]), floor("1", [["B1", 120]]), true, a, b, none, none)).toBeUndefined();
  // Buildings that don't touch still join where two corridors are within 15 m (a bridge).
  const far = { rings: square(110, 200), center: [155, 25] as Point };
  expect(floorJoin(floor("1", [["A1", 95]]), floor("1", [["B1", 108]]), false, a, far, none, none)?.[2]).toBe(13);
  expect(floorJoin(floor("1", [["A1", 70]]), floor("1", [["B1", 120]]), false, a, far, none, none)).toBeUndefined();
  // A floor without positions joins only when the outlines touch, at the corridors nearest each other's centre.
  const hub = { code: "1", level: 1, hub: true, corridors: [{ name: "Building B, floor 1", at: undefined }] };
  const viaA = attach({ corridor: { name: "A1", at: [70, 25] } });
  const viaB = attach({ corridor: { name: "Building B, floor 1", at: undefined } });
  expect(floorJoin(floor("1", [["A1", 70]]), hub, true, a, b, viaA, viaB)?.map((x) => (typeof x === "number" ? x : x.name))).toEqual(["A1", "Building B, floor 1", 0]);
  expect(floorJoin(floor("1", [["A1", 70]]), hub, false, a, b, viaA, viaB)).toBeUndefined();
});

test("path network: keeps ends, junctions and sharp bends; steps are not step-free; drops stray pieces", () => {
  // Node positions in degrees around MIT; 0.0001 degrees of latitude is about 11 m.
  const node = (id: number, lat: number, lon: number) => ({ type: "node", id, lat, lon });
  const way = (id: number, nodes: number[], tags: object) => ({ type: "way", id, nodes, tags });
  const elements = [
    node(1, 42.36, -71.09), node(2, 42.3601, -71.09), node(3, 42.3602, -71.09), // straight: 2 is dropped
    node(4, 42.3602, -71.0898), // a right-angle bend at 3, kept
    node(5, 42.3603, -71.0898),
    node(8, 42.37, -71.10), node(9, 42.3701, -71.10), // a stray piece
    way(10, [1, 2, 3, 4], { highway: "footway", name: "Main Path" }),
    way(11, [4, 5], { highway: "steps" }),
    way(12, [8, 9], { highway: "footway" }),
    way(13, [5, 1], { highway: "primary" }), // busy road: never walked
  ];
  const { points, edges } = pathNetwork(elements);
  expect(points.map((p) => p.id).sort()).toEqual(["1", "3", "4", "5"]);
  expect(edges.map((e) => [e.from, e.to, Math.round(e.meters), e.stepFree, e.name])).toEqual([
    ["1", "3", 22, true, "Main Path"],
    ["3", "4", 16, true, "Main Path"],
    ["4", "5", 11, false, ""],
  ]);
});

test("misread labels: used only when exactly one unplaced room on the floor reads the same", () => {
  const rooms = [
    { code: "1", sub: "100LA" }, { code: "1", sub: "144B" }, { code: "1", sub: "140" },
    { code: "1", sub: "1O5" }, { code: "1", sub: "105" }, // two rooms that read alike: neither gets "1O5"'s twin
    { code: "2", sub: "200LA" },
  ];
  const at = (x: number): Point => [x, 0];
  const located: Located = new Map([
    ["1001A", { floor: "1", at: at(1) }], // 100LA misread
    ["1448", { floor: "1", at: at(2) }], // 144B misread
    ["140", { floor: "1", at: at(3) }], // exact
    ["10D", { floor: "1", at: at(4) }], // reads like both 1O5? no: like neither (10D → 100)
    ["1O5X", { floor: "1", at: at(5) }],
    ["2001A", { floor: "1", at: at(6) }], // 200LA's label, but on the wrong floor
  ]);
  const out = withMisreadings(rooms, located);
  expect(out.get("100LA")?.at).toEqual(at(1));
  expect(out.get("144B")?.at).toEqual(at(2));
  expect(out.get("140")?.at).toEqual(at(3));
  expect(out.has("1O5") || out.has("105")).toBe(false);
  expect(out.has("200LA")).toBe(false);
});

test("a room also opens onto its next nearest corridor within 25 m; floor 00 is below floor 0", () => {
  const two = `"FLOOR","ROOM NUMBER","SQ FT","ROOM USE","DEPARTMENT","MAJOR USE"
"1","9-100CA","500","CORRIDOR","",""
"","9-100CB","500","CORRIDOR","",""
"","9-100CC","500","CORRIDOR","",""
"","9-123","3,550","LECTURE HALL","",""`;
  const located: Located = new Map([
    ["100CA", { floor: "1", at: [0, 0] as Point }],
    ["100CB", { floor: "1", at: [30, 0] as Point }],
    ["100CC", { floor: "1", at: [80, 0] as Point }],
    ["123", { floor: "1", at: [12, 0] as Point }],
  ]);
  const doors = interior("9", two, located).links.filter((l) => l[1] === "9-123 Lecture Hall").map((l) => l[0]);
  expect(doors).toEqual(["9-100CA Corridor", "9-100CB Corridor"]);
  expect([parseFloor("00")!.level, parseFloor("0")!.level, parseFloor("G4")!.level]).toEqual([-1, 0, 4]);
});

test("paths: ramped steps are step-free, and an unnamed sidewalk takes the name of the street beside it", () => {
  const node = (id: number, lat: number, lon: number) => ({ type: "node", id, lat, lon });
  const way = (id: number, nodes: number[], tags: object) => ({ type: "way", id, nodes, tags });
  const { edges } = pathNetwork(
    [
      node(1, 42.36, -71.09), node(2, 42.3601, -71.09), node(3, 42.3602, -71.09),
      way(10, [1, 2], { highway: "footway", footway: "sidewalk" }),
      way(11, [2, 3], { highway: "steps", "ramp:wheelchair": "yes" }),
    ],
    // In metres around (42.36, -71.09), where the sidewalk starts: a street 10 m east of it, and one 60 m west.
    [{ name: "Vassar Street", line: [[10, -100], [10, 100]] as Point[] }, { name: "Far Street", line: [[-60, -100], [-60, 100]] as Point[] }],
  );
  expect(edges.map((e) => [e.name, e.stepFree])).toEqual([["Vassar Street", true], ["", true]]);
});

test("joined buildings join where their traced spaces come closest", () => {
  // Lat/long rings: A has corridors far (A1) and near (A2) its east end; B's lobby starts 5 m east of A2.
  const m = 1 / 111320 / Math.cos((42.36 * Math.PI) / 180); // degrees of longitude per metre
  const box = (x0: number, x1: number): [number, number][] => [[42.36, -71.09 + x0 * m], [42.36, -71.09 + x1 * m], [42.36002, -71.09 + x1 * m], [42.36002, -71.09 + x0 * m]];
  const spot = (name: string, x: number) => ({ name, at: [x, 1] as Point });
  const fa = { code: "1", level: 1, hub: false, corridors: [spot("A-100CA Corridor", 5), spot("A-100CB Corridor", 25)] };
  const fb = { code: "1", level: 1, hub: false, corridors: [spot("B-100LA Lobby", 40)] };
  const join = tracedMeeting(fa, fb, { "100CA": box(0, 10), "100CB": box(20, 30) }, { "100LA": box(35, 45) });
  expect(join?.slice(0, 2).map((s: any) => s.name)).toEqual(["A-100CB Corridor", "B-100LA Lobby"]);
  expect(tracedMeeting(fa, fb, { "100CA": box(0, 10) }, { "100LA": box(35, 45) })).toBeUndefined(); // 25 m apart
});
