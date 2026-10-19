// Builds the campus map (data/campus.json) the app loads alongside the Simmons map.
//
// Inputs, kept out of git in data/raw/ because MIT Facilities data is for internal use:
//   rooms/<building>.csv  MIT's room inventory for one building ("Report Download" on
//                         floorplans.mit.edu/reports/BuildingRoomList<building>.html), listing every
//                         room by floor with its use (CORRIDOR, ELEVATOR, STAIRWAY, CLASSROOM, ...).
//   osm.json              OpenStreetMap building footprints tagged with MIT building numbers,
//                         downloaded on the first run.
//   centers.json          MapIT's public building centres, downloaded on the first run, for
//                         buildings OpenStreetMap has no outline for.
//   whereis.json          Building names from whereis.mit.edu for buildings OpenStreetMap leaves unnamed.
//   entrances.json        OpenStreetMap entrance nodes, downloaded on the first run.
//   relative-room-locations.json
//                         MapIT's position for every room label on MIT's floor plans (save
//                         https://mitmapit.org/api/relative-room-locations while signed in). Optional:
//                         without it every floor is a single corridor.
//
// Every building becomes a place joined to its nearby buildings by outdoor walks. Inside a building with a
// room list, each floor is a network of its corridors, lobbies and bridges at their real positions, with
// rooms, elevator stops and stairways attached to the corridor nearest them (a floor without positions is
// a single corridor). Each elevator is one service, so flagging any ride blocks the whole elevator.
// Touching buildings are joined indoors on a floor when each has a corridor within 35 m of the other's
// outline; any corridors within 15 m are joined too (bridges); floors without positions join where outlines touch. Simmons (W79) keeps its hand-made map from
// data/simmons.json and is joined at its main lobby.
// Usage: bun run campus
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

type Kind = "ENTRANCE" | "HALLWAY" | "ROOM" | "TRANSIT";
export type Place = { name: string; kind: Kind; floor: number; latitude: number; longitude: number };
// source, destination, forward, backward, accessible, closedFrom, closedUntil, service, distance
export type Link = [string, string, string, string, boolean, number, number, string, number];
export type Point = [number, number];
type Building = { ref: string; name: string; rings: Point[][]; center: Point };

const raw = new URL("../data/raw/", import.meta.url);

// Costs use the Simmons map's units: one corridor hop is 1, a flight of stairs 2, an elevator 3.5 plus
// half a unit per floor. Walking outside costs 1 per 50 m on top of getting through the door.
const WALK = 1;
const ENTER = 0.5;
// Inside, a connection costs a little for the turn plus the metres over 50, on the same scale as walking outside.
const indoorWalk = (meters: number) => 0.2 + meters / 50;
const CORRIDOR_NEIGHBOURS = 3;
const CORRIDOR_REACH = 40; // corridors further apart than this are only joined if nothing nearer joins them
const MEETING_METERS = 15; // corridors of any two buildings this close on one floor are a way through (bridges)
// Corridors are marked at their middles, so where two touching buildings join, each has a corridor this close to the other's outline.
const REACHES_NEIGHBOUR = 35;
const ENTRANCE_REACH = 15;
const CORRIDORS = new Set(["CORRIDOR", "LOBBY", "BRIDGE/TUNNEL"]);
const STAIRS_PER_FLOOR = 2;
const elevatorRide = (floors: number) => 3.5 + 0.5 * floors;
const outdoorWalk = (meters: number) => 1 + meters / 50;
const NEIGHBOURS = 4;
// Buildings this close get a direct walk, so a route says "walk 250 m north-east" once instead of hopping past every building in between.
const DIRECT_METERS = 300;
const TOUCHING_METERS = 2;

// Room uses worth offering as destinations. Closets, shafts, and private support space are left out,
// and so are bedrooms in residence halls.
const DESTINATIONS = new Set([
  "CLASSROOM", "LECTURE HALL", "TEACHING LAB", "STUDY ROOM", "STACK/STUDY", "LOUNGE", "CONFERENCE ROOM",
  "OFFICE", "RESEARCH LAB", "RSCH LAB-OFFICE", "FOOD FACILITY", "MALE LAVATORY", "FEMALE LAVATORY",
  "PUBLIC LAVATORY", "COMPUTER FACIL", "EXHIBITION FACIL", "STUDIO", "MUSIC PRACTICE", "WELLNESS ROOM",
  "RECEPTION", "MAIL ROOM", "MERCHAND FACIL", "LIBRARY", "READING ROOM", "AUDITORIUM", "GYMNASIUM",
  "ATHLETIC FACIL", "MEETING ROOM", "CHAPEL", "THEATER",
]);

// A building people know by name reads "Stata Center (Building 32)"; one without a name is just "Building 32".
const buildingPlace = (b: Building) => (b.name ? `${b.name} (Building ${b.ref})` : `Building ${b.ref}`);
const hubName = (ref: string, code: string) => `Building ${ref}, floor ${code}`;
const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** "D4" -> tower D, level 4. Codes without digits (roofs, penthouses) are skipped. */
export function parseFloor(code: string) {
  const m = /^([A-Z]*)(\d+)(M?)$/.exec(code);
  return m ? { tower: m[1], digits: m[2], level: Number(m[2]) + (m[3] ? 0.5 : 0) } : undefined;
}

/** Minimal CSV for the room inventory: quoted fields, commas inside quotes (as in "1,043"). */
export function parseCsv(text: string) {
  const rows = text.trim().split(/\r?\n/).map((line) => [...line.matchAll(/"([^"]*)"|([^,]+)|(?<=,|^)(?=,|$)/g)].map((m) => m[1] ?? m[2] ?? ""));
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

export type Spot = { name: string; at: Point | undefined };
export type Floor = { code: string; level: number; corridors: Spot[]; hub: boolean };
/** Positions of one building's room labels, by room number without the building ("100LA"), for one floor code. */
export type Located = Map<string, { floor: string; at: Point }>;

const meters = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const nearest = (spots: Spot[], at: Point) =>
  spots.reduce((best, s) => (meters(s.at!, at) < meters(best.at!, at) ? s : best), spots[0]);
const middle = (spots: Spot[]): Point => [
  spots.reduce((t, s) => t + s.at![0], 0) / spots.length,
  spots.reduce((t, s) => t + s.at![1], 0) / spots.length,
];

/**
 * One building's interior from its room list, placing corridors, rooms, elevators and stairs where
 * `located` says they are. Positions are in metres (see toMeters); places without one are left at undefined.
 */
export function interior(ref: string, csv: string, located: Located = new Map()) {
  const places: (Place & { at?: Point })[] = [];
  const links: Link[] = [];
  const floors = new Map<string, Floor>();
  const stops = new Map<string, { code: string; level: number; at?: Point }[]>(); // E1 -> its stops
  const flights = new Map<string, { code: string; level: number; at?: Point }[]>(); // tower + SA -> its landings
  const rooms: { name: string; code: string; level: number; number: string; use: string; at?: Point }[] = [];
  let code = "";
  for (const row of parseCsv(csv)) {
    if (row.FLOOR) code = row.FLOOR;
    const number = row["ROOM NUMBER"];
    const floor = parseFloor(code);
    if (!number || !floor) continue;
    const here = floors.get(code) ?? floors.set(code, { code, level: floor.level, corridors: [], hub: false }).get(code)!;
    const use = row["ROOM USE"];
    const sub = number.slice(number.indexOf("-") + 1);
    const spot = located.get(sub);
    const at = spot?.floor === code ? spot.at : undefined; // a label on another floor is a misreading
    const local = sub.replace(/^[A-Z]*/, "");
    if (CORRIDORS.has(use)) {
      if (at) here.corridors.push({ name: `${number} ${title(use)}`, at });
    } else if (use === "ELEVATOR") {
      const id = /E\d+$/.exec(number)?.[0];
      if (id) (stops.get(id) ?? stops.set(id, []).get(id)!).push({ code, level: floor.level, at });
    } else if (use === "STAIRWAY" && local.startsWith(`${floor.digits}00`)) {
      const id = floor.tower + local.slice(floor.digits.length + 2);
      (flights.get(id) ?? flights.set(id, []).get(id)!).push({ code, level: floor.level, at });
    } else if (DESTINATIONS.has(use)) {
      rooms.push({ name: `${number} ${title(use)}`, code, level: floor.level, number, use, at });
    }
  }
  const ordered = [...floors.values()].sort((a, b) => a.level - b.level);

  for (const f of ordered) {
    if (!f.corridors.length) {
      // No positions on this floor: one corridor, as before.
      f.hub = true;
      f.corridors.push({ name: hubName(ref, f.code), at: undefined });
      places.push({ name: hubName(ref, f.code), kind: "TRANSIT", floor: f.level, latitude: 0, longitude: 0 });
      continue;
    }
    for (const c of f.corridors) places.push({ name: c.name, kind: "TRANSIT", floor: f.level, latitude: 0, longitude: 0, at: c.at });
    // Each corridor to its nearest few within reach, then the closest pairs that join separate pieces.
    const n = f.corridors.length;
    const joined = new Set<string>();
    const join = (i: number, j: number) => {
      const key = i < j ? `${i},${j}` : `${j},${i}`;
      if (joined.has(key)) return;
      joined.add(key);
      const a = f.corridors[i], b = f.corridors[j];
      const m = Math.round(meters(a.at!, b.at!));
      links.push([a.name, b.name, `Walk about ${m} m along the corridor.`, `Walk about ${m} m along the corridor.`, true, 0, 0, "", indoorWalk(m)]);
    };
    for (let i = 0; i < n; i++) {
      const close = [...Array(n).keys()].filter((j) => j !== i).sort((x, y) => meters(f.corridors[i].at!, f.corridors[x].at!) - meters(f.corridors[i].at!, f.corridors[y].at!));
      for (const j of close.slice(0, CORRIDOR_NEIGHBOURS)) if (meters(f.corridors[i].at!, f.corridors[j].at!) <= CORRIDOR_REACH) join(i, j);
    }
    const parent = [...Array(n).keys()];
    const root = (i: number): number => (parent[i] === i ? i : (parent[i] = root(parent[i])));
    for (const key of joined) { const [i, j] = key.split(",").map(Number); parent[root(i)] = root(j); }
    for (;;) {
      let best: [number, number] | undefined;
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
          if (root(i) !== root(j) && (!best || meters(f.corridors[i].at!, f.corridors[j].at!) < meters(f.corridors[best[0]].at!, f.corridors[best[1]].at!))) best = [i, j];
      if (!best) break;
      join(...best);
      parent[root(best[0])] = root(best[1]);
    }
  }

  /** Where something at `at` on floor `code` joins the floor, and how far it is from there. */
  const attach = (code: string, at: Point | undefined) => {
    const f = floors.get(code)!;
    if (f.hub) return { corridor: f.corridors[0], meters: undefined, at: undefined };
    const corridor = nearest(f.corridors, at ?? middle(f.corridors));
    return { corridor, meters: at ? Math.round(meters(corridor.at!, at)) : undefined, at: at ?? corridor.at };
  };
  const walkTo = (m: number | undefined, what: string) => (m === undefined ? `Go to ${what}` : `Walk about ${m} m to ${what}`);

  for (const [id, list] of [...stops].sort()) {
    const served = list.sort((a, b) => a.level - b.level);
    for (let i = 0; i < served.length; i++) {
      for (let j = i + 1; j < served.length; j++) {
        const lo = attach(served[i].code, served[i].at), hi = attach(served[j].code, served[j].at);
        links.push([
          lo.corridor.name, hi.corridor.name,
          `${walkTo(lo.meters, `elevator ${id}`)} and take it up to floor ${served[j].code}.`,
          `${walkTo(hi.meters, `elevator ${id}`)} and take it down to floor ${served[i].code}.`,
          true, 0, 0, `Building ${ref} elevator ${id}`,
          elevatorRide(served[j].level - served[i].level) + ((lo.meters ?? 0) + (hi.meters ?? 0)) / 50,
        ]);
      }
    }
  }
  for (const [id, list] of [...flights].sort()) {
    const landings = list.sort((a, b) => a.level - b.level);
    for (let i = 0; i + 1 < landings.length; i++) {
      const [a, b] = [landings[i], landings[i + 1]];
      if (b.level - a.level > 1.5) continue; // a gap in the list, not a real flight
      const lo = attach(a.code, a.at), hi = attach(b.code, b.at);
      links.push([
        lo.corridor.name, hi.corridor.name,
        `${walkTo(lo.meters, `stairway ${id}`)} and take it up to floor ${b.code}.`,
        `${walkTo(hi.meters, `stairway ${id}`)} and take it down to floor ${a.code}.`,
        false, 0, 0, "", STAIRS_PER_FLOOR * (b.level - a.level) + ((lo.meters ?? 0) + (hi.meters ?? 0)) / 50,
      ]);
    }
  }
  for (const r of rooms) {
    const { corridor, meters: m, at } = attach(r.code, r.at);
    places.push({ name: r.name, kind: "ROOM", floor: r.level, latitude: 0, longitude: 0, at });
    links.push([
      corridor.name, r.name,
      `${walkTo(m, `${r.number} (${title(r.use).toLowerCase()})`)}.`, `Leave ${r.number} for the corridor.`,
      true, 0, 0, "", m === undefined ? WALK : indoorWalk(m),
    ]);
  }
  // The ground floor is floor 1, or the lowest floor above it, or the lowest floor.
  const ground = ordered.find((f) => f.code === "1") ?? ordered.find((f) => f.level >= 1) ?? ordered[0];
  return { places, links, floors, ground, attach };
}

// ---- Geometry: OpenStreetMap footprints in metres around MIT. ----

const LAT0 = 42.36;
const toMeters = (lon: number, lat: number): Point => [
  (lon + 71.09) * 111320 * Math.cos((LAT0 * Math.PI) / 180),
  (lat - LAT0) * 110540,
];
/** The inverse of toMeters, rounded to about 1 cm. */
const toLatLon = ([x, y]: Point) => ({
  latitude: Number((y / 110540 + LAT0).toFixed(7)),
  longitude: Number((x / (111320 * Math.cos((LAT0 * Math.PI) / 180)) - 71.09).toFixed(7)),
});
function segmentDistance([px, py]: Point, [ax, ay]: Point, [bx, by]: Point) {
  const dx = bx - ax, dy = by - ay;
  const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
// ponytail: vertex-to-edge distance, so a footprint wholly inside another reads as apart; fine for buildings.
export function footprintDistance(a: Point[][], b: Point[][]) {
  let best = Infinity;
  for (const [from, to] of [[a, b], [b, a]])
    for (const ring of from) for (const p of ring) for (const other of to)
      for (let i = 0; i + 1 < other.length; i++) best = Math.min(best, segmentDistance(p, other[i], other[i + 1]));
  return best;
}
function direction([ax, ay]: Point, [bx, by]: Point) {
  const names = ["east", "north-east", "north", "north-west", "west", "south-west", "south", "south-east"];
  return names[(Math.round(Math.atan2(by - ay, bx - ax) / (Math.PI / 4)) + 8) % 8];
}

async function loadBuildings(): Promise<Building[]> {
  const file = new URL("osm.json", raw);
  if (!existsSync(file)) {
    const query = '[out:json][timeout:90];(way["building"]["ref"](42.353,-71.110,42.366,-71.080);relation["building"]["ref"](42.353,-71.110,42.366,-71.080););out tags geom;';
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "user-agent": "mit-nav (6.1040 class project)" },
      body: new URLSearchParams({ data: query }),
    });
    if (!response.ok) throw new Error(`Overpass answered ${response.status}`);
    writeFileSync(file, await response.text());
  }
  const byRef = new Map<string, Building>();
  for (const e of JSON.parse(readFileSync(file, "utf8")).elements) {
    const ref: string | undefined = e.tags?.ref;
    // MIT building numbers: 32, 6C, E14, NW86, W85ABC. Leaves out street addresses such as 181MA.
    if (!ref || !/^(?:[NESW]{1,2}|WW)?\d+[A-Z]*$/.test(ref) || /MA$/.test(ref)) continue;
    const outlines = e.type === "way" ? [e.geometry] : (e.members ?? []).filter((m: any) => m.role !== "inner" && m.geometry).map((m: any) => m.geometry);
    const rings: Point[][] = outlines.filter((g: any[]) => g?.length >= 3).map((g: any[]) => g.map((p) => toMeters(p.lon, p.lat)));
    if (!rings.length) continue;
    // OSM names often repeat the number ("32 Stata Center"), and some are only the number.
    const name = (e.tags.name ?? "").replace(new RegExp(`^${ref}\\b\\s*`), "");
    const b = byRef.get(ref) ?? byRef.set(ref, { ref, name, rings: [], center: [0, 0] }).get(ref)!;
    b.rings.push(...rings);
    b.name ||= name;
  }
  // Buildings OpenStreetMap has no outline for (such as 12, 46 and E15) come in as a single point at
  // the centre MapIT publishes, which is enough for outdoor walks; they just never count as touching.
  const centersFile = new URL("centers.json", raw);
  if (!existsSync(centersFile)) {
    const response = await fetch("https://mitmapit.org/api/building-centers");
    if (!response.ok) throw new Error(`MapIT answered ${response.status}`);
    writeFileSync(centersFile, await response.text());
  }
  for (const c of JSON.parse(readFileSync(centersFile, "utf8"))) {
    if (byRef.has(c.building)) continue;
    const p = toMeters(Number(c.long), Number(c.lat));
    byRef.set(c.building, { ref: c.building, name: "", rings: [[p, p]], center: p });
  }
  // OpenStreetMap's short names ("Stata Center") read best; whereis.mit.edu fills in the rest.
  const whereisFile = new URL("whereis.json", raw);
  const whereis: Record<string, string> = existsSync(whereisFile) ? JSON.parse(readFileSync(whereisFile, "utf8")) : {};
  for (const b of byRef.values()) {
    if (b.name || b.ref in whereis) continue;
    const response = await fetch(`https://whereis.mit.edu/search?type=query&q=${encodeURIComponent(b.ref)}&output=json`);
    const hits = response.ok ? await response.json() : [];
    whereis[b.ref] = hits.find((h: any) => h.bldgnum === b.ref)?.name ?? "";
  }
  writeFileSync(whereisFile, JSON.stringify(whereis, null, 2));
  for (const b of byRef.values()) {
    // Drop names that only repeat the number, such as "Building 24" or "Maclaurin Buildings (10)" -> "Maclaurin Buildings".
    const name = (whereis[b.ref] ?? "").replace(new RegExp(`\\s*\\(${b.ref}\\)$`), "");
    if (!b.name && name && !new RegExp(`^(Building )?${b.ref}$`, "i").test(name)) b.name = name;
  }
  for (const b of byRef.values()) {
    const all = b.rings.flat();
    b.center = [all.reduce((s, p) => s + p[0], 0) / all.length, all.reduce((s, p) => s + p[1], 0) / all.length];
  }
  return [...byRef.values()].sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }));
}

/** Outdoor walks: each building to its nearest few and everything within DIRECT_METERS, then the closest pairs that join separate clusters. */
export function outdoorPairs(buildings: Building[], gap: (a: number, b: number) => number) {
  const pairs = new Set<string>();
  const key = (i: number, j: number) => (i < j ? `${i},${j}` : `${j},${i}`);
  buildings.forEach((_, i) => {
    const nearest = buildings.map((_, j) => j).filter((j) => j !== i).sort((x, y) => gap(i, x) - gap(i, y));
    for (const j of nearest.slice(0, NEIGHBOURS)) pairs.add(key(i, j));
    for (const j of nearest) if (gap(i, j) <= DIRECT_METERS) pairs.add(key(i, j));
  });
  const parent = buildings.map((_, i) => i);
  const root = (i: number): number => (parent[i] === i ? i : (parent[i] = root(parent[i])));
  for (const p of pairs) { const [i, j] = p.split(",").map(Number); parent[root(i)] = root(j); }
  for (;;) {
    let best: [number, number] | undefined;
    for (let i = 0; i < buildings.length; i++)
      for (let j = i + 1; j < buildings.length; j++)
        if (root(i) !== root(j) && (!best || gap(i, j) < gap(...best))) best = [i, j];
    if (!best) break;
    pairs.add(key(...best));
    parent[root(best[0])] = root(best[1]);
  }
  return [...pairs].map((p) => p.split(",").map(Number) as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/**
 * Where two buildings join on one floor, if they do: corridors within 15 m (a bridge); or, for touching
 * buildings, each one's corridor nearest the other's outline when both are within 35 m of it; or, when either
 * floor has no positions, touching buildings at their corridors nearest each other's centre.
 */
export function floorJoin(
  fa: Floor, fb: Floor, touching: boolean,
  ba: Pick<Building, "rings" | "center">, bb: Pick<Building, "rings" | "center">,
  attachA: (code: string, at: Point | undefined) => { corridor: Spot }, attachB: (code: string, at: Point | undefined) => { corridor: Spot },
): [Spot, Spot, number] | undefined {
  if (fa.hub || fb.hub) return touching ? [attachA(fa.code, bb.center).corridor, attachB(fb.code, ba.center).corridor, 0] : undefined;
  let pair: [Spot, Spot, number] | undefined;
  for (const x of fa.corridors) for (const y of fb.corridors) {
    const m = meters(x.at!, y.at!);
    if (m <= MEETING_METERS && (!pair || m < pair[2])) pair = [x, y, m];
  }
  if (pair || !touching) return pair;
  const toward = (spots: Spot[], rings: Point[][]) =>
    spots.map((c) => [c, footprintDistance([[c.at!, c.at!]], rings)] as const).sort((x, y) => x[1] - y[1])[0];
  const [x, dx] = toward(fa.corridors, bb.rings);
  const [y, dy] = toward(fb.corridors, ba.rings);
  return dx <= REACHES_NEIGHBOUR && dy <= REACHES_NEIGHBOUR ? [x, y, meters(x.at!, y.at!)] : undefined;
}

async function cached(file: URL, fetchIt: () => Promise<string>) {
  if (!existsSync(file)) writeFileSync(file, await fetchIt());
  return JSON.parse(readFileSync(file, "utf8"));
}

/** OpenStreetMap entrances, in metres. */
async function loadEntrances(): Promise<Point[]> {
  const data = await cached(new URL("entrances.json", raw), async () => {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "user-agent": "mit-nav (6.1040 class project)" },
      body: new URLSearchParams({ data: '[out:json][timeout:90];node["entrance"](42.353,-71.110,42.366,-71.080);out;' }),
    });
    if (!response.ok) throw new Error(`Overpass answered ${response.status}`);
    return response.text();
  });
  return data.elements.map((e: any) => toMeters(e.lon, e.lat));
}

/** MapIT's room positions by building, when the file has been saved; otherwise none. */
function loadLocated(): Map<string, Located> {
  const file = new URL("relative-room-locations.json", raw);
  const byBuilding = new Map<string, Located>();
  if (!existsSync(file)) return byBuilding;
  for (const b of JSON.parse(readFileSync(file, "utf8"))) {
    const located: Located = new Map();
    for (const f of b.floors) for (const r of f.roomLocations) located.set(r.subNumber, { floor: f.floor, at: toMeters(Number(r.long), Number(r.lat)) });
    byBuilding.set(b.building, located);
  }
  return byBuilding;
}

export async function buildCampus() {
  const buildings = await loadBuildings();
  const places: Place[] = [];
  const links: Link[] = [];
  const dir = new URL("rooms/", raw);
  const lists = new Set(existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".csv")).map((f) => f.slice(0, -4)) : []);
  lists.delete("W79"); // Simmons has its own hand-made map.

  for (const b of buildings) places.push({ name: buildingPlace(b), kind: "ENTRANCE", floor: 1, ...toLatLon(b.center) });

  const gaps = new Map<string, number>();
  const gap = (i: number, j: number) => {
    const k = i < j ? `${i},${j}` : `${j},${i}`;
    if (!gaps.has(k)) gaps.set(k, footprintDistance(buildings[i].rings, buildings[j].rings));
    return gaps.get(k)!;
  };
  for (const [i, j] of outdoorPairs(buildings, gap)) {
    const a = buildings[i], b = buildings[j];
    const meters = Math.round(Math.hypot(a.center[0] - b.center[0], a.center[1] - b.center[1]));
    links.push([
      buildingPlace(a), buildingPlace(b),
      `Walk outside to ${buildingPlace(b)}, about ${meters} m to the ${direction(a.center, b.center)}.`,
      `Walk outside to ${buildingPlace(a)}, about ${meters} m to the ${direction(b.center, a.center)}.`,
      true, 0, 0, "", outdoorWalk(meters),
    ]);
  }

  const entrances = await loadEntrances();
  const located = loadLocated();
  const inside = new Map<string, ReturnType<typeof interior>>();
  for (const b of buildings) {
    if (!lists.has(b.ref)) continue;
    const plan = interior(b.ref, readFileSync(new URL(`${b.ref}.csv`, dir), "utf8"), located.get(b.ref));
    inside.set(b.ref, plan);
    // Placed corridors and rooms keep their own position; the rest share their building's.
    places.push(...plan.places.map(({ at, ...p }) => ({ ...p, ...toLatLon(at ?? b.center) })));
    links.push(...plan.links);
    if (!plan.ground) continue;
    // In from the corridor nearest each entrance close to the building, or from the one nearest its centre.
    const doors = plan.ground.hub ? [] : entrances.filter((e) => footprintDistance([[e, e]], b.rings) <= ENTRANCE_REACH);
    const ways = new Set((doors.length ? doors : [b.center]).map((at) => plan.attach(plan.ground!.code, at).corridor.name));
    for (const corridor of ways) {
      links.push([buildingPlace(b), corridor, `Go inside ${buildingPlace(b)} to floor ${plan.ground.code}.`, `Leave ${buildingPlace(b)}.`, true, 0, 0, "", ENTER]);
    }
  }
  // Indoors between buildings: where corridors meet on a floor, or, without positions, where outlines touch.
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const a = inside.get(buildings[i].ref), b = inside.get(buildings[j].ref);
      if (!a || !b || gap(i, j) > 100) continue;
      for (const [code, fa] of a.floors) {
        const fb = b.floors.get(code);
        if (!fb) continue;
        const pair = floorJoin(fa, fb, gap(i, j) <= TOUCHING_METERS, buildings[i], buildings[j], a.attach, b.attach);
        if (!pair) continue;
        const m = Math.round(pair[2]);
        links.push([
          pair[0].name, pair[1].name,
          `Continue ${m ? `about ${m} m ` : ""}into ${buildingPlace(buildings[j])} on floor ${code}.`,
          `Continue ${m ? `about ${m} m ` : ""}into ${buildingPlace(buildings[i])} on floor ${code}.`,
          true, 0, 0, "", m ? indoorWalk(m) : WALK,
        ]);
      }
    }
  }
  const simmons = buildings.find((b) => b.ref === "W79");
  if (simmons) {
    links.push([
      buildingPlace(simmons), "Main Lobby Entrance",
      "Go inside Simmons Hall through the main lobby.", "Head out from Simmons Hall onto Vassar Street.",
      true, 0, 0, "", ENTER,
    ]);
  }
  return { places, links, buildings: buildings.length, interiors: [...inside.keys()] };
}

if (import.meta.main) {
  const { places, links, buildings, interiors } = await buildCampus();
  writeFileSync(
    new URL("../data/campus.json", import.meta.url),
    JSON.stringify({ note: "Generated by scripts/campus-to-map.ts. Do not edit by hand.", places, links }) + "\n",
  );
  console.log(`Wrote ${places.length} places and ${links.length} connections for ${buildings} buildings (${interiors.length} with interiors: ${interiors.join(" ")}).`);
}
