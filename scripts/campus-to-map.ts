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
//
// Every building becomes a place joined to its nearest neighbours by outdoor walks. A building with a
// room list also gets one corridor per floor, its elevators (one service each, so flagging any ride
// blocks the whole elevator), its stairs, and the rooms a visitor would look for. Buildings whose
// footprints touch are joined indoors on the floors they share. Simmons (W79) keeps its hand-made map
// from data/simmons.json and is joined at its main lobby.
// Usage: bun run campus
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

type Kind = "ENTRANCE" | "HALLWAY" | "ROOM" | "TRANSIT";
export type Place = { name: string; kind: Kind; floor: number };
// source, destination, forward, backward, accessible, closedFrom, closedUntil, service, distance
export type Link = [string, string, string, string, boolean, number, number, string, number];
type Point = [number, number];
type Building = { ref: string; name: string; rings: Point[][]; center: Point };

const raw = new URL("../data/raw/", import.meta.url);

// Costs use the Simmons map's units: one corridor hop is 1, a flight of stairs 2, an elevator 3.5 plus
// half a unit per floor. Walking outside costs 1 per 50 m on top of getting through the door.
const WALK = 1;
const ENTER = 0.5;
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

const buildingPlace = (b: Building) => (b.name ? `Building ${b.ref} (${b.name})` : `Building ${b.ref}`);
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

/** One building's interior from its room list. */
export function interior(ref: string, csv: string) {
  const places: Place[] = [];
  const links: Link[] = [];
  const hubs = new Map<string, number>(); // floor code -> level
  const elevators = new Map<string, Map<string, number>>(); // E1 -> code -> level
  const stairs = new Map<string, Map<string, number>>(); // tower + SA -> code -> level
  const rooms: { name: string; code: string; level: number; number: string; use: string }[] = [];
  let code = "";
  for (const row of parseCsv(csv)) {
    if (row.FLOOR) code = row.FLOOR;
    const number = row["ROOM NUMBER"];
    const floor = parseFloor(code);
    if (!number || !floor) continue;
    hubs.set(code, floor.level);
    const use = row["ROOM USE"];
    const local = number.slice(number.indexOf("-") + 1).replace(/^[A-Z]*/, "");
    if (use === "ELEVATOR") {
      const id = /E\d+$/.exec(number)?.[0];
      if (id) (elevators.get(id) ?? elevators.set(id, new Map()).get(id)!).set(code, floor.level);
    } else if (use === "STAIRWAY" && local.startsWith(`${floor.digits}00`)) {
      const id = floor.tower + local.slice(floor.digits.length + 2);
      (stairs.get(id) ?? stairs.set(id, new Map()).get(id)!).set(code, floor.level);
    } else if (DESTINATIONS.has(use)) {
      rooms.push({ name: `${number} ${title(use)}`, code, level: floor.level, number, use });
    }
  }
  const byLevel = (m: Map<string, number>) => [...m].sort((a, b) => a[1] - b[1]);
  for (const [c, level] of byLevel(hubs)) places.push({ name: hubName(ref, c), kind: "TRANSIT", floor: level });
  for (const [id, served] of [...elevators].sort()) {
    const floors = byLevel(served);
    for (let i = 0; i < floors.length; i++) {
      for (let j = i + 1; j < floors.length; j++) {
        const [lo, loLevel] = floors[i], [hi, hiLevel] = floors[j];
        links.push([
          hubName(ref, lo), hubName(ref, hi),
          `Take elevator ${id} up to floor ${hi}.`, `Take elevator ${id} down to floor ${lo}.`,
          true, 0, 0, `Building ${ref} elevator ${id}`, elevatorRide(hiLevel - loLevel),
        ]);
      }
    }
  }
  for (const [id, served] of [...stairs].sort()) {
    const floors = byLevel(served);
    for (let i = 0; i + 1 < floors.length; i++) {
      const [lo, loLevel] = floors[i], [hi, hiLevel] = floors[i + 1];
      if (hiLevel - loLevel > 1.5) continue; // a gap in the list, not a real flight
      links.push([
        hubName(ref, lo), hubName(ref, hi),
        `Take stairway ${id} up to floor ${hi}.`, `Take stairway ${id} down to floor ${lo}.`,
        false, 0, 0, "", STAIRS_PER_FLOOR * (hiLevel - loLevel),
      ]);
    }
  }
  for (const r of rooms) {
    places.push({ name: r.name, kind: "ROOM", floor: r.level });
    links.push([
      hubName(ref, r.code), r.name,
      `Walk to ${r.number} (${title(r.use).toLowerCase()}).`, `Leave ${r.number} for the floor ${r.code} corridor.`,
      true, 0, 0, "", WALK,
    ]);
  }
  // The way in is on the first floor, or the lowest floor above ground when there is no first floor.
  const levels = byLevel(hubs);
  const ground = levels.find(([c]) => c === "1") ?? levels.find(([, l]) => l >= 1) ?? levels[0];
  return { places, links, floors: new Map(levels), ground: ground?.[0] };
}

// ---- Geometry: OpenStreetMap footprints in metres around MIT. ----

const LAT0 = 42.36;
const toMeters = (lon: number, lat: number): Point => [
  (lon + 71.09) * 111320 * Math.cos((LAT0 * Math.PI) / 180),
  (lat - LAT0) * 110540,
];
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

export async function buildCampus() {
  const buildings = await loadBuildings();
  const places: Place[] = [];
  const links: Link[] = [];
  const dir = new URL("rooms/", raw);
  const lists = new Set(existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".csv")).map((f) => f.slice(0, -4)) : []);
  lists.delete("W79"); // Simmons has its own hand-made map.

  for (const b of buildings) places.push({ name: buildingPlace(b), kind: "ENTRANCE", floor: 1 });

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
      `Walk outside to Building ${b.ref}, about ${meters} m to the ${direction(a.center, b.center)}.`,
      `Walk outside to Building ${a.ref}, about ${meters} m to the ${direction(b.center, a.center)}.`,
      true, 0, 0, "", outdoorWalk(meters),
    ]);
  }

  const inside = new Map<string, ReturnType<typeof interior>>();
  for (const b of buildings) {
    if (!lists.has(b.ref)) continue;
    const plan = interior(b.ref, readFileSync(new URL(`${b.ref}.csv`, dir), "utf8"));
    inside.set(b.ref, plan);
    places.push(...plan.places);
    links.push(...plan.links);
    if (plan.ground) {
      links.push([
        buildingPlace(b), hubName(b.ref, plan.ground),
        `Go inside Building ${b.ref} to floor ${plan.ground}.`, `Leave Building ${b.ref}.`,
        true, 0, 0, "", ENTER,
      ]);
    }
  }
  // ponytail: touching buildings are joined on every floor both have; per-floor connection data would fix the few that are not.
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const a = inside.get(buildings[i].ref), b = inside.get(buildings[j].ref);
      if (!a || !b || gap(i, j) > TOUCHING_METERS) continue;
      for (const code of a.floors.keys()) {
        if (!b.floors.has(code) || !/^\d+$/.test(code)) continue;
        links.push([
          hubName(buildings[i].ref, code), hubName(buildings[j].ref, code),
          `Continue into Building ${buildings[j].ref} on floor ${code}.`,
          `Continue into Building ${buildings[i].ref} on floor ${code}.`,
          true, 0, 0, "", WALK,
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
