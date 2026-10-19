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
//   paths.json            OpenStreetMap footpaths, sidewalks, crossings and small streets, downloaded on the first run.
//   relative-room-locations.json
//                         MapIT's position for every room label on MIT's floor plans (save
//                         https://mitmapit.org/api/relative-room-locations while signed in). Optional:
//                         without it every floor is a single corridor.
//
// Every building becomes a place at its main entrance, joined to OpenStreetMap's paths at its entrances, so
// outdoor walks follow real sidewalks and crossings (steps are not step-free). Inside a building with a
// room list, each floor is a network of its corridors, lobbies and bridges at their real positions, with
// rooms, elevator stops and stairways attached to the corridor nearest them (a floor without positions is
// a single corridor). Each elevator is one service, so flagging any ride blocks the whole elevator.
// Touching buildings are joined indoors on a floor when each has a corridor within 35 m of the other's
// outline; any corridors within 15 m are joined too (bridges); floors without positions join where outlines
// touch. For the page's floor plans it also writes web/plans/<building>.json: the outline and every room the
// inventory places on each floor, with its use, position and area (drawn on plans, never routed), and the room's
// outline when one was traced from MIT's drawing (see tracedOutlines).
// Usage: bun run campus
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

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
const SECOND_DOOR = 25; // a room also opens onto its next nearest corridor within this many metres
const CORRIDOR_REACH = 40; // corridors further apart than this are only joined if nothing nearer joins them
const MEETING_METERS = 15; // corridors of any two buildings this close on one floor are a way through (bridges)
// Corridors are marked at their middles, so where two touching buildings join, each has a corridor this close to the other's outline.
const REACHES_NEIGHBOUR = 35;
const ENTRANCE_REACH = 15;
const CORRIDORS = new Set(["CORRIDOR", "LOBBY", "BRIDGE/TUNNEL"]);
const STAIRS_PER_FLOOR = 2;
const elevatorRide = (floors: number) => 3.5 + 0.5 * floors;
const outdoorWalk = (meters: number) => 1 + meters / 50;
const NEIGHBOURS = 3;
const PATH_REACH = 80; // a building further than this from every path keeps straight walks to its nearest buildings
const BEND_DEGREES = 30; // a path point that turns more than this stays a point of its own
// Ways people walk along. Busy roads are left out because their sidewalks and crossings are mapped separately.
const WALKABLE = /^(footway|path|pedestrian|steps|living_street|residential|service|unclassified|cycleway|track|corridor)$/;
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
  // "00" is the level below "0".
  return m ? { tower: m[1], digits: m[2], level: (m[2] === "00" ? -1 : Number(m[2])) + (m[3] ? 0.5 : 0) } : undefined;
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

// Characters the machine reading of MapIT's labels confuses, each mapped to one stand-in.
const LOOKALIKE: Record<string, string> = { L: "1", I: "1", O: "0", D: "0", Q: "0", S: "5", B: "8", Z: "2", G: "6", T: "7" };
const readAlike = (label: string) => label.replace(/[LIODQSBZGT]/g, (c) => LOOKALIKE[c]);

/**
 * Adds misread labels to `located`: a label that matches no room on its floor is used for the one room on that floor
 * without a label that reads the same with lookalike characters swapped, when exactly one room and one label do.
 */
export function withMisreadings(rooms: { code: string; sub: string }[], located: Located): Located {
  const out: Located = new Map(located);
  const inventory = new Set(rooms.map((r) => r.sub));
  for (const code of new Set(rooms.map((r) => r.code))) {
    const unplaced = rooms.filter((r) => r.code === code && located.get(r.sub)?.floor !== code);
    const labels = [...located].filter(([sub, l]) => l.floor === code && !inventory.has(sub));
    for (const [label, spot] of labels) {
      const key = readAlike(label);
      const rooms = unplaced.filter((r) => readAlike(r.sub) === key);
      const twins = labels.filter(([other]) => readAlike(other) === key);
      if (rooms.length === 1 && twins.length === 1 && !out.has(rooms[0].sub)) out.set(rooms[0].sub, spot);
    }
  }
  return out;
}

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
  // Every positioned room in the inventory, for the plan drawing (closets and shafts included).
  const drawn: { code: string; level: number; number: string; use: string; at: Point; area: number }[] = [];
  let code = "";
  const rows = parseCsv(csv).map((row) => ({ ...row, FLOOR: (code = row.FLOOR || code) }));
  located = withMisreadings(rows.filter((r) => r["ROOM NUMBER"]).map((r) => ({ code: r.FLOOR, sub: r["ROOM NUMBER"].slice(r["ROOM NUMBER"].indexOf("-") + 1) })), located);
  for (const row of rows) {
    code = row.FLOOR;
    const number = row["ROOM NUMBER"];
    const floor = parseFloor(code);
    if (!number || !floor) continue;
    const here = floors.get(code) ?? floors.set(code, { code, level: floor.level, corridors: [], hub: false }).get(code)!;
    const use = row["ROOM USE"];
    const sub = number.slice(number.indexOf("-") + 1);
    const spot = located.get(sub);
    const at = spot?.floor === code ? spot.at : undefined; // a label on another floor is a misreading
    const local = sub.replace(/^[A-Z]*/, "");
    const area = Math.round(Number(row["SQ FT"].replace(/,/g, "")) * 0.0929) || 0; // square feet to square metres
    if (at) drawn.push({ code, level: floor.level, number: sub, use, at, area });
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
    const door = (from: Spot, m: number | undefined): Link => [
      from.name, r.name,
      `${walkTo(m, `${r.number} (${title(r.use).toLowerCase()})`)}.`, `Leave ${r.number} for the corridor.`,
      true, 0, 0, "", m === undefined ? WALK : indoorWalk(m),
    ];
    links.push(door(corridor, m));
    // Also from the next nearest corridor when it is close, so a big room can be reached from either side.
    const f = floors.get(r.code)!;
    if (!r.at || f.hub) continue;
    const second = f.corridors.filter((c) => c !== corridor).sort((a, b) => meters(a.at!, r.at!) - meters(b.at!, r.at!))[0];
    if (second && meters(second.at!, r.at) <= SECOND_DOOR) links.push(door(second, Math.round(meters(second.at!, r.at))));
  }
  // The ground floor is floor 1, or the lowest floor above it, or the lowest floor.
  const ground = ordered.find((f) => f.code === "1") ?? ordered.find((f) => f.level >= 1) ?? ordered[0];
  return { places, links, floors, ground, attach, drawn };
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
function footprintDistance(a: Point[][], b: Point[][]) {
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

/** OpenStreetMap's walkable ways with their node ids, so junctions can be found. */
async function loadPaths() {
  return cached(new URL("paths.json", raw), async () => {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "user-agent": "mit-nav (6.1040 class project)" },
      body: new URLSearchParams({
        data: `[out:json][timeout:120];way["highway"~"${WALKABLE.source}"]["access"!~"^(private|no)$"]["foot"!~"^(no|private)$"](42.353,-71.110,42.366,-71.080);(._;>;);out body;`,
      }),
    });
    if (!response.ok) throw new Error(`Overpass answered ${response.status}`);
    return response.text();
  });
}

/** OpenStreetMap's named streets (any named way that is not a footpath), as lines in metres. */
async function loadStreets(): Promise<Street[]> {
  const data = await cached(new URL("streets.json", raw), async () => {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "user-agent": "mit-nav (6.1040 class project)" },
      body: new URLSearchParams({ data: '[out:json][timeout:90];way["highway"]["highway"!~"^(footway|steps|corridor|path)$"]["name"](42.353,-71.110,42.366,-71.080);out geom;' }),
    });
    if (!response.ok) throw new Error(`Overpass answered ${response.status}`);
    return response.text();
  });
  return data.elements.map((e: any) => ({ name: e.tags.name, line: e.geometry.map((g: any) => toMeters(g.lon, g.lat)) }));
}
type Street = { name: string; line: Point[] };
const SIDEWALK_REACH = 25; // a sidewalk takes the name of the nearest named street within this many metres
const toSegment = (p: Point, a: Point, b: Point) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return meters(p, [a[0] + t * dx, a[1] + t * dy]);
};
/** The name of the named street nearest `p` within SIDEWALK_REACH, or "". */
function besideStreet(p: Point, streets: Street[]) {
  let best = "", bestMeters = SIDEWALK_REACH;
  for (const s of streets)
    for (let i = 1; i < s.line.length; i++) {
      const m = toSegment(p, s.line[i - 1], s.line[i]);
      if (m <= bestMeters) [best, bestMeters] = [s.name, m];
    }
  return best;
}

export type PathPoint = { id: string; at: Point };
export type PathEdge = { from: string; to: string; meters: number; stepFree: boolean; name: string };

/**
 * The walkable network, kept to the points that matter: ends, junctions, and bends sharper than BEND_DEGREES.
 * Each edge is the walk along one way between two such points; only the largest connected piece is kept.
 */
export function pathNetwork(elements: any[], streets: Street[] = []) {
  const nodes = new Map<number, Point>();
  for (const e of elements) if (e.type === "node") nodes.set(e.id, toMeters(e.lon, e.lat));
  const ways = elements.filter((e) => e.type === "way" && WALKABLE.test(e.tags?.highway ?? "") && e.nodes.every((n: number) => nodes.has(n)));
  const uses = new Map<number, number>();
  for (const w of ways) for (const n of w.nodes) uses.set(n, (uses.get(n) ?? 0) + 1);
  const turn = (a: Point, b: Point, c: Point) => {
    const angle = Math.abs(Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]));
    return (Math.min(angle, 2 * Math.PI - angle) * 180) / Math.PI;
  };
  const edges: PathEdge[] = [];
  for (const w of ways) {
    const t = w.tags;
    // Steps with a wheelchair ramp alongside, or marked usable by wheelchairs, are step-free.
    const stepFree = (t.highway !== "steps" || t["ramp:wheelchair"] === "yes" || t.wheelchair === "yes") && t.wheelchair !== "no";
    const sidewalk = !t.name && t.footway === "sidewalk";
    const name = t.name ?? (t.footway === "crossing" ? "a crosswalk" : "");
    let start = 0;
    let walked = 0;
    for (let i = 1; i < w.nodes.length; i++) {
      walked += meters(nodes.get(w.nodes[i])!, nodes.get(w.nodes[i - 1])!);
      const last = i === w.nodes.length - 1;
      const keep = last || uses.get(w.nodes[i])! > 1 || turn(nodes.get(w.nodes[i - 1])!, nodes.get(w.nodes[i])!, nodes.get(w.nodes[i + 1])!) > BEND_DEGREES;
      if (!keep) continue;
      if (w.nodes[start] !== w.nodes[i]) {
        const a = nodes.get(w.nodes[start])!, b = nodes.get(w.nodes[i])!;
        const beside = sidewalk ? besideStreet([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], streets) : "";
        edges.push({ from: String(w.nodes[start]), to: String(w.nodes[i]), meters: walked, stepFree, name: beside || name });
      }
      start = i;
      walked = 0;
    }
  }
  // Keep the largest connected piece; private yards and stray fragments would only strand a route.
  const parent = new Map<string, string>();
  const root = (x: string): string => {
    const up = parent.get(x) ?? x;
    if (up === x) return x;
    const top = root(up);
    parent.set(x, top);
    return top;
  };
  for (const e of edges) {
    const a = root(e.from), b = root(e.to);
    if (a !== b) parent.set(a, b);
  }
  const size = new Map<string, number>();
  for (const e of edges) size.set(root(e.from), (size.get(root(e.from)) ?? 0) + 1);
  const biggest = [...size].sort((a, b) => b[1] - a[1])[0]?.[0];
  const kept = edges.filter((e) => root(e.from) === biggest);
  const points = new Map<string, PathPoint>();
  for (const e of kept) for (const id of [e.from, e.to]) points.set(id, { id, at: nodes.get(Number(id))! });
  return { points: [...points.values()], edges: kept };
}

/**
 * Room outlines traced from MIT's drawings (scripts/fit-drawings.py), by floor code and room number. Without this
 * machine's traced file, the building's current plan file keeps the outlines it already has.
 */
export function tracedOutlines(ref: string): Record<string, Record<string, [number, number][]>> {
  const local = new URL(`drawings/outlines/${ref}.json`, raw);
  if (existsSync(local)) return JSON.parse(readFileSync(local, "utf8"));
  const committed = new URL(`../web/plans/${ref}.json`, import.meta.url);
  if (!existsSync(committed)) return {};
  const plan = JSON.parse(readFileSync(committed, "utf8"));
  const kept: Record<string, Record<string, [number, number][]>> = {};
  for (const [code, floor] of Object.entries<any>(plan.floors)) for (const r of floor.rooms) if (r.s) (kept[code] ??= {})[r.n] = r.s;
  return kept;
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

async function buildCampus() {
  const buildings = await loadBuildings();
  const places: Place[] = [];
  const links: Link[] = [];
  const dir = new URL("rooms/", raw);
  const lists = new Set(existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".csv")).map((f) => f.slice(0, -4)) : []);

  // Each building's entrances: mapped entrances within ENTRANCE_REACH of its outline, the main one first.
  const entranceNodes = (await cached(new URL("entrances.json", raw), async () => {
    await loadEntrances();
    return readFileSync(new URL("entrances.json", raw), "utf8");
  })).elements;
  const doorsOf = new Map<string, { at: Point; main: boolean }[]>();
  for (const b of buildings) {
    const doors = entranceNodes
      .map((e: any) => ({ at: toMeters(e.lon, e.lat), main: e.tags?.entrance === "main" }))
      .filter((d: { at: Point }) => footprintDistance([[d.at, d.at]], b.rings) <= ENTRANCE_REACH)
      .sort((x: any, y: any) => Number(y.main) - Number(x.main) || meters(x.at, b.center) - meters(y.at, b.center));
    doorsOf.set(b.ref, doors);
  }
  const where = (b: Building) => doorsOf.get(b.ref)![0]?.at ?? b.center;
  for (const b of buildings) places.push({ name: buildingPlace(b), kind: "ENTRANCE", floor: 1, ...toLatLon(where(b)) });

  const gaps = new Map<string, number>();
  const gap = (i: number, j: number) => {
    const k = i < j ? `${i},${j}` : `${j},${i}`;
    if (!gaps.has(k)) gaps.set(k, footprintDistance(buildings[i].rings, buildings[j].rings));
    return gaps.get(k)!;
  };

  // Outside: the path network, and each building joined to it at its entrances (or the path point nearest it).
  const paths = pathNetwork((await loadPaths()).elements, await loadStreets());
  const pathName = (id: string) => `Path ${id}`;
  for (const pt of paths.points) places.push({ name: pathName(pt.id), kind: "TRANSIT", floor: 1, ...toLatLon(pt.at) });
  for (const e of paths.edges) {
    const text = `Walk about ${Math.max(1, Math.round(e.meters))} m outside${e.name ? ` along ${e.name}` : ""}.`;
    // Along a path only the metres count, so a path is not penalised for its bends.
    links.push([pathName(e.from), pathName(e.to), text, text, e.stepFree, 0, 0, "", e.meters / 50]);
  }
  const unreached: number[] = [];
  buildings.forEach((b, i) => {
    const doors = doorsOf.get(b.ref)!.map((d) => d.at);
    const joins = new Map<string, number>();
    for (const at of doors.length ? doors : [where(b)]) {
      let best: PathPoint | undefined;
      for (const pt of paths.points) if (!best || meters(pt.at, at) < meters(best.at, at)) best = pt;
      if (!best) continue;
      const m = meters(best.at, at) + meters(at, where(b));
      if (m <= PATH_REACH && !((joins.get(best.id) ?? Infinity) <= m)) joins.set(best.id, m);
    }
    if (!joins.size) unreached.push(i);
    for (const [id, m] of joins) {
      const r = Math.max(1, Math.round(m));
      links.push([buildingPlace(b), pathName(id), `Walk about ${r} m outside.`, `Walk about ${r} m to the entrance of ${buildingPlace(b)}.`, true, 0, 0, "", outdoorWalk(m)]);
    }
  });
  // ponytail: a building far from every mapped path gets straight walks to its nearest buildings; mapping its paths in OSM fixes it.
  for (const i of unreached) {
    for (const j of buildings.map((_, k) => k).filter((k) => k !== i).sort((x, y) => gap(i, x) - gap(i, y)).slice(0, NEIGHBOURS)) {
      const a = buildings[i], b = buildings[j];
      const m = Math.round(meters(where(a), where(b)));
      links.push([
        buildingPlace(a), buildingPlace(b),
        `Walk outside to ${buildingPlace(b)}, about ${m} m to the ${direction(where(a), where(b))}.`,
        `Walk outside to ${buildingPlace(a)}, about ${m} m to the ${direction(where(b), where(a))}.`,
        true, 0, 0, "", outdoorWalk(m),
      ]);
    }
  }

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
    const doors = plan.ground.hub ? [] : doorsOf.get(b.ref)!.map((d) => d.at);
    // Entering costs the walk from the building's place (its main entrance) to each entry corridor, so passing
    // through the building's place is never a shortcut between two of its corridors.
    const ways = new Map<string, Point | undefined>();
    for (const at of doors.length ? doors : [b.center]) {
      const { corridor } = plan.attach(plan.ground!.code, at);
      ways.set(corridor.name, corridor.at);
    }
    for (const [corridor, at] of ways) {
      const m = at ? meters(at, where(b)) : 0;
      links.push([buildingPlace(b), corridor, `Go inside ${buildingPlace(b)} to floor ${plan.ground.code}.`, `Leave ${buildingPlace(b)}.`, true, 0, 0, "", ENTER + m / 50]);
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
  // One plan file per converted building: its outline and every positioned room on each floor.
  const latLon = (pt: Point) => { const { latitude, longitude } = toLatLon(pt); return [latitude, longitude]; };
  const planFiles = new Map<string, object>();
  for (const b of buildings) {
    const plan = inside.get(b.ref);
    if (!plan) continue;
    const floors: Record<string, { level: number; rooms: object[] }> = {};
    const traced = tracedOutlines(b.ref);
    for (const r of plan.drawn) {
      const s = traced[r.code]?.[r.number];
      (floors[r.code] ??= { level: r.level, rooms: [] }).rooms.push({ n: r.number, u: r.use, at: latLon(r.at), a: r.area, ...(s ? { s } : {}) });
    }
    planFiles.set(b.ref, { outline: b.rings.map((ring) => ring.map(latLon)), floors });
  }
  return { places, links, planFiles, buildings: buildings.length, interiors: [...inside.keys()] };
}

if (import.meta.main) {
  const { places, links, planFiles, buildings, interiors } = await buildCampus();
  const plans = new URL("../web/plans/", import.meta.url);
  mkdirSync(plans, { recursive: true });
  for (const [ref, plan] of planFiles) writeFileSync(new URL(`${ref}.json`, plans), JSON.stringify(plan) + "\n");
  writeFileSync(
    new URL("../data/campus.json", import.meta.url),
    JSON.stringify({ note: "Generated by scripts/campus-to-map.ts. Do not edit by hand.", places, links }) + "\n",
  );
  console.log(`Wrote ${places.length} places and ${links.length} connections for ${buildings} buildings (${interiors.length} with interiors: ${interiors.join(" ")}).`);
}
