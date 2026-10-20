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
import { nearestOpen, walkToward } from "../web/indoor.ts";
import { roomShapes } from "../web/shapes.ts";

type Kind = "ENTRANCE" | "HALLWAY" | "ROOM" | "TRANSIT";
export type Place = { name: string; kind: Kind; floor: number; latitude: number; longitude: number };
// source, destination, forward, backward, accessible, closedFrom, closedUntil, service, distance, outdoor (only outdoor walks carry
// it), and the path walked, "lat,lon lat,lon ..." (only links traced over a floor's outlines carry it; see withPaths)
export type Link = [string, string, string, string, boolean, number, number, string, number, boolean?, string?];
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
const BUILDING_PREFIX = /^([A-Z]*\d+[A-Z]*)-/;
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
  const stops = new Map<string, { code: string; level: number; at?: Point; number: string }[]>(); // E1 -> its stops
  const flights = new Map<string, { code: string; level: number; at?: Point; number: string }[]>(); // tower + SA -> its landings
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
      if (id) (stops.get(id) ?? stops.set(id, []).get(id)!).push({ code, level: floor.level, at, number });
    } else if (use === "STAIRWAY" && local.startsWith(`${floor.digits}00`)) {
      const id = floor.tower + local.slice(floor.digits.length + 2);
      (flights.get(id) ?? flights.set(id, []).get(id)!).push({ code, level: floor.level, at, number });
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

  // Each stop and landing is a place of its own, reached from its corridor by a walk, so a route changes floor there.
  const landing = (what: string, id: string, stop: { code: string; at?: Point; number: string }) => {
    const name = `${stop.number} ${title(what)}`;
    const { corridor, meters: m, at } = attach(stop.code, stop.at);
    places.push({ name, kind: "TRANSIT", floor: floors.get(stop.code)!.level, latitude: 0, longitude: 0, at });
    links.push([corridor.name, name, `${walkTo(m, `${what} ${id}`)}.`, `Leave ${what} ${id} for the corridor.`, true, 0, 0, "", m === undefined ? WALK : indoorWalk(m)]);
    return name;
  };
  for (const [id, list] of [...stops].sort()) {
    const served = list.sort((a, b) => a.level - b.level);
    const names = served.map((stop) => landing("elevator", id, stop));
    for (let i = 0; i < served.length; i++) {
      for (let j = i + 1; j < served.length; j++) {
        links.push([
          names[i], names[j],
          `Take elevator ${id} up to floor ${served[j].code}.`, `Take elevator ${id} down to floor ${served[i].code}.`,
          true, 0, 0, `Building ${ref} elevator ${id}`, elevatorRide(served[j].level - served[i].level),
        ]);
      }
    }
  }
  for (const [id, list] of [...flights].sort()) {
    const landings = list.sort((a, b) => a.level - b.level);
    const names = landings.map((l) => landing("stairway", id, l));
    for (let i = 0; i + 1 < landings.length; i++) {
      const [a, b] = [landings[i], landings[i + 1]];
      if (b.level - a.level > 1.5) continue; // a gap in the list, not a real flight
      links.push([names[i], names[i + 1], `Take stairway ${id} up to floor ${b.code}.`, `Take stairway ${id} down to floor ${a.code}.`, false, 0, 0, "", STAIRS_PER_FLOOR * (b.level - a.level)]);
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

const SPACES_MEET = 15; // metres: joined buildings join where their traced spaces come closest, when that is this close

/**
 * Where two buildings' traced corridors, lobbies, bridges or unlabelled open floor on one floor come closest (within
 * SPACES_MEET; the stretch between is often a doorway or vestibule no drawing traces): each building's traced corridor
 * nearest that point, and the walk between them through it. Undefined when either floor has no traced corridor or the
 * spaces are further apart.
 */
export function tracedMeeting(fa: Floor, fb: Floor, ta: Record<string, any> | undefined, tb: Record<string, any> | undefined): [Spot, Spot, number] | undefined {
  const flat = (ring: [number, number][]): Point[] => { const r = ring.map(([lat, lon]) => toMeters(lon, lat)); return [...r, r[0]]; };
  const shapes = (f: Floor, t: Record<string, any> | undefined) => {
    const named = f.corridors.flatMap((c) => { const ring = t?.[/^[^-]+-(\S+)/.exec(c.name)?.[1] ?? ""]; return c.at && Array.isArray(ring) ? [{ spot: c, ring: flat(ring) }] : []; });
    return { named, all: [...named.map((n) => n.ring), ...((t?.[""] ?? []) as [number, number][][]).map(flat)] };
  };
  const A = shapes(fa, ta), B = shapes(fb, tb);
  if (!A.named.length || !B.named.length) return undefined;
  let best = SPACES_MEET, at: Point | undefined;
  for (const [from, to] of [[A.all, B.all], [B.all, A.all]])
    for (const ring of from) for (const p of ring) for (const other of to)
      for (let i = 0; i + 1 < other.length; i++) {
        const d = segmentDistance(p, other[i], other[i + 1]);
        if (d < best) [best, at] = [d, p];
      }
  if (!at) return undefined;
  const nearest = (named: { spot: Spot; ring: Point[] }[]) => {
    const d = (r: Point[]) => Math.min(...r.slice(0, -1).map((q, i) => segmentDistance(at!, q, r[i + 1])));
    return named.reduce((x, y) => (d(y.ring) < d(x.ring) ? y : x)).spot;
  };
  const x = nearest(A.named), y = nearest(B.named);
  return [x, y, meters(x.at!, at) + meters(at, y.at!)];
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
 * Room outlines traced from MIT's drawings (scripts/fit-drawings.py), by floor code and room number ("" holds the floor's
 * unlabelled open floor, "!" the rooms whose outlines were recovered from beyond the footprint). Without this
 * machine's traced file, the building's current plan file keeps the outlines it already has.
 */
export function tracedOutlines(ref: string): Record<string, Record<string, any>> {
  const local = new URL(`drawings/outlines/${ref}.json`, raw);
  if (existsSync(local)) return JSON.parse(readFileSync(local, "utf8"));
  const committed = new URL(`../web/plans/${ref}.json`, import.meta.url);
  if (!existsSync(committed)) return {};
  const plan = JSON.parse(readFileSync(committed, "utf8"));
  const kept: Record<string, Record<string, any>> = {};
  for (const [code, floor] of Object.entries<any>(plan.floors)) {
    for (const r of floor.rooms) if (r.s) (kept[code] ??= {})[r.n] = r.s;
    for (const r of floor.rooms) if (r.d) ((kept[code] ??= {})["~"] ??= {})[r.n] = r.d;
    const recovered = floor.rooms.filter((r: any) => r.f).map((r: any) => r.n);
    if (recovered.length) (kept[code] ??= {})["!"] = recovered;
    if (floor.open) (kept[code] ??= {})[""] = floor.open;
    if (floor.openD) (kept[code] ??= {})["~open"] = floor.openD;
  }
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

const CIRCULATION = /^(CORRIDOR|LOBBY|BRIDGE\/TUNNEL|PVT CIRCULATION)$/;
const SNAP = 6; // metres: a corridor marked beside its traced floor is moved onto it
const HALL_REACH = 15; // metres: a room without an outline is met at the open floor this near it
const DOOR_REACH = 4; // metres: a traced room is joined through its door at the open floor this near it
type LatLon = [number, number];
const encode = (path: LatLon[]) => path.map(([lat, lon]) => `${lat.toFixed(7)},${lon.toFixed(7)}`).join(" ");
const latLonMeters = (a: LatLon, b: LatLon) => Math.hypot((b[1] - a[1]) * 111_320 * Math.cos((a[0] * Math.PI) / 180), (b[0] - a[0]) * 111_320);
/** A rectangle STRIP_WIDTH metres wide around the segment from `p` to `q`. */
const STRIP_WIDTH = 3;
function strip(p: LatLon, q: LatLon): LatLon[] {
  const k = Math.cos((p[0] * Math.PI) / 180);
  const dx = (q[1] - p[1]) * 111_320 * k, dy = (q[0] - p[0]) * 111_320, len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (STRIP_WIDTH / 2), ny = (dx / len) * (STRIP_WIDTH / 2); // half the width, across the segment
  const off = (r: LatLon, x: number, y: number): LatLon => [r[0] + y / 111_320, r[1] + x / (111_320 * k)];
  return [off(p, nx, ny), off(q, nx, ny), off(q, -nx, -ny), off(p, -nx, -ny)];
}
const pathMeters = (path: LatLon[]) => path.reduce((t, p, i) => (i ? t + latLonMeters(path[i - 1], p) : 0), 0);

/**
 * The route line, settled once here instead of in the page: every indoor connection on a traced floor gets the path a
 * person walks along it through the floor's traced spaces (corridors, lobbies, bridges, lounges, unlabelled open floor
 * and the connection's own two rooms at normal cost, other traced rooms twenty times dearer, as web/indoor.ts does), and
 * its distance and metres become that path's length. A corridor marked beside its floor is first moved onto it (within
 * SNAP). A room without an outline (a seated hall) is met at the open floor nearest it, within HALL_REACH, and the path
 * then runs straight to its position. A connection between two buildings on one floor is one walk over both floors,
 * with a strip between the two places making the gap between the outlines walkable. A connection the floor does not
 * join keeps its straight line; the count of those says how much tracing is still missing.
 */
export function withPaths(places: Place[], links: Link[], planFiles: Map<string, any>) {
  const byName = new Map(places.map((p) => [p.name, p]));
  const building = (name: string) => BUILDING_PREFIX.exec(name)?.[1];
  const roomOf = (name: string, ref: string) => name.split(" ")[0].slice(ref.length + 1);
  const floorOf = (ref: string, level: number) => {
    const plan = planFiles.get(ref);
    return plan && Object.values<any>(plan.floors).find((f) => f.level === level && f.rooms.length);
  };
  const SERVICE = /^(SHAFT SPACE|ELECTRIC CLOSET|TELECOM CLOSET|UTILITY\/MECH RM|CUSTODIAL CLOSET)$/;
  // Every room's shape on a floor, traced or approximate, as the page draws it; closets are left out as there.
  const shapesOf = new Map<any, { room: any; shapes: LatLon[][] }[]>();
  const shaped = (ref: string, f: any) => shapesOf.get(f) ?? shapesOf.set(f, roomShapes(f.rooms.filter((r: any) => !SERVICE.test(r.u)), planFiles.get(ref).outline)).get(f)!;
  const at = (p: Place): LatLon => [p.latitude, p.longitude];
  // The floor's walkable space: the whole outline except the rooms (traced corridors, lobbies, bridges, lounges and open
  // floor count as open even where a room's approximate shape covers them), and the connection's own two rooms.
  const spaces = (ref: string, level: number, own: string[]) => {
    const f = floorOf(ref, level);
    if (!f) return undefined;
    const preferred: LatLon[][] = [...(f.open ?? [])], other: LatLon[][] = [];
    for (const { room: r, shapes } of shaped(ref, f)) {
      if (CIRCULATION.test(r.u) || r.u === "LOUNGE" || own.includes(r.n)) { if (r.s) preferred.push(r.s); }
      else if (!r.f) other.push(...shapes);
    }
    return { preferred, other, base: planFiles.get(ref).outline as LatLon[][], traced: (n: string) => f.rooms.some((r: any) => r.n === n && r.s) };
  };
  // Corridors onto their floor.
  for (const p of places) {
    const ref = building(p.name);
    if (p.kind !== "TRANSIT" || !ref) continue;
    const s = spaces(ref, p.floor, []);
    const moved = s && s.preferred.length && nearestOpen(s.preferred, at(p), SNAP);
    if (moved) [p.latitude, p.longitude] = moved;
  }
  let traced = 0, straight = 0;
  const metres = (text: string, m: number) => text.replace(/about \d+ m/, `about ${Math.max(1, Math.round(m))} m`);
  for (const l of links) {
    const a = byName.get(l[0])!, b = byName.get(l[1])!;
    const ra = building(a.name), rb = building(b.name);
    if (l[9] || !ra || !rb || a.floor !== b.floor) continue;
    const own = [a, b].map((p) => roomOf(p.name, building(p.name)!));
    const sa = spaces(ra, a.floor, own), sb = ra === rb ? sa : spaces(rb, b.floor, own);
    if (!sa && !sb) continue;
    const reach = (s: NonNullable<typeof sa>, p: Place) => (s.traced(roomOf(p.name, building(p.name)!)) || p.kind === "TRANSIT" ? DOOR_REACH : HALL_REACH);
    // Out of a hall the walk is found backwards, so it starts at the open floor the hall is met from. A connection between
    // two buildings is one walk over both floors, with a strip between the two places making the gap between the
    // outlines (a door, bridge or passage) walkable; rooms in either building still cost as rooms.
    const both = ra === rb ? sa! : { preferred: [...(sa?.preferred ?? []), ...(sb?.preferred ?? [])], other: [...(sa?.other ?? []), ...(sb?.other ?? [])], base: [...(sa?.base ?? []), ...(sb?.base ?? []), strip(at(a), at(b))] };
    const w = walkToward(both.preferred, at(b), at(a), both.other, sa ? reach(sa, a) : DOOR_REACH, both.base);
    const path = w && [at(a), ...w.path.reverse(), at(b)];
    if (!path) { straight++; continue; }
    traced++;
    const m = pathMeters(path);
    l[2] = metres(l[2], m);
    l[3] = metres(l[3], m);
    l[8] = indoorWalk(m);
    l[10] = encode(path.filter((p, i) => !i || p[0] !== path[i - 1][0] || p[1] !== path[i - 1][1]));
  }
  return { traced, straight };
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
    links.push([pathName(e.from), pathName(e.to), text, text, e.stepFree, 0, 0, "", e.meters / 50, true]);
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
      links.push([buildingPlace(b), pathName(id), `Walk about ${r} m outside.`, `Walk about ${r} m to the entrance of ${buildingPlace(b)}.`, true, 0, 0, "", outdoorWalk(m), true]);
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
        true, 0, 0, "", outdoorWalk(m), true,
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
  const outlinesOf = new Map<string, ReturnType<typeof tracedOutlines>>();
  const traced = (ref: string) => outlinesOf.get(ref) ?? outlinesOf.set(ref, tracedOutlines(ref)).get(ref)!;
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const a = inside.get(buildings[i].ref), b = inside.get(buildings[j].ref);
      if (!a || !b || gap(i, j) > 100) continue;
      for (const [code, fa] of a.floors) {
        const fb = b.floors.get(code);
        if (!fb) continue;
        const joined = floorJoin(fa, fb, gap(i, j) <= TOUCHING_METERS, buildings[i], buildings[j], a.attach, b.attach);
        // Where both floors are traced, joined buildings join where their corridors or open floor actually meet
        // (whether they join at all stays with floorJoin: a party wall without a door looks the same up close).
        const pair = joined && (tracedMeeting(fa, fb, traced(buildings[i].ref)[code], traced(buildings[j].ref)[code]) ?? joined);
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
      // `f` marks an outline recovered from beyond the footprint: the route line only starts or ends in one.
      const f = s && traced[r.code]?.["!"]?.includes(r.number);
      // `d` is a corridor's outline smoothed for drawing (without its doorway notches); routes use `s`.
      const d = s && traced[r.code]?.["~"]?.[r.number];
      (floors[r.code] ??= { level: r.level, rooms: [] }).rooms.push({ n: r.number, u: r.use, at: latLon(r.at), a: r.area, ...(s ? { s } : {}), ...(d ? { d } : {}), ...(f ? { f: 1 } : {}) });
    }
    // Unlabelled open floor traced on each floor (key ""), for drawing route lines through corridors no room names.
    for (const [code, f] of Object.entries(floors)) {
      if (!traced[code]?.[""]?.length) continue;
      (f as any).open = traced[code][""];
      if (traced[code]["~open"]?.length === traced[code][""].length) (f as any).openD = traced[code]["~open"];
    }
    planFiles.set(b.ref, { outline: b.rings.map((ring) => ring.map(latLon)), floors });
  }
  const lines = withPaths(places, links, planFiles);
  return { places, links, planFiles, buildings: buildings.length, interiors: [...inside.keys()], paths: lines };
}

if (import.meta.main) {
  const { places, links, planFiles, buildings, interiors, paths } = await buildCampus();
  const plans = new URL("../web/plans/", import.meta.url);
  mkdirSync(plans, { recursive: true });
  for (const [ref, plan] of planFiles) writeFileSync(new URL(`${ref}.json`, plans), JSON.stringify(plan) + "\n");
  writeFileSync(
    new URL("../data/campus.json", import.meta.url),
    JSON.stringify({ note: "Generated by scripts/campus-to-map.ts. Do not edit by hand.", places, links }) + "\n",
  );
  console.log(`Wrote ${places.length} places and ${links.length} connections for ${buildings} buildings (${interiors.length} with interiors: ${interiors.join(" ")}).`);
  console.log(`Traced the path of ${paths.traced} indoor connections; ${paths.straight} on traced floors stay straight (the floor does not join them).`);
}
