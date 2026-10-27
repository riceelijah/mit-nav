// Audits the route lines in data/campus.json: every traced path is sampled each half metre, and samples that fall inside
// a room the walk should not cross (any room but corridors, lobbies, bridges, lounges, rooms open to the floor's flooded
// hallway, the connection's own two places and the rooms of their suites (same number, another letter), by its traced
// or schematic shape) are counted; so are samples off the floor's traced hallways, open floor and circulation (and the
// two places' own shapes), where the line is not on any space the drawing showed. Prints the worst connections and a
// total per building.
// Usage: bun scripts/audit-paths.ts [building ...]
import { readFileSync } from "node:fs";
import { roomShapes } from "../web/shapes.ts";

const only = new Set(process.argv.slice(2));
const campus = JSON.parse(readFileSync(new URL("../data/campus.json", import.meta.url), "utf8"));
const places = new Map<string, any>(campus.places.map((p: any) => [p.name, p]));
const BUILDING = /^([A-Z]*\d+[A-Z]*)-/;
const CIRCULATION = /^(CORRIDOR|LOBBY|BRIDGE\/TUNNEL|PVT CIRCULATION|LOUNGE)$/;
const SERVICE = /^(SHAFT SPACE|ELECTRIC CLOSET|TELECOM CLOSET|UTILITY\/MECH RM|CUSTODIAL CLOSET)$/;
const plans = new Map<string, any>();
const plan = (ref: string) => {
  if (!plans.has(ref)) {
    try { plans.set(ref, JSON.parse(readFileSync(new URL(`../web/plans/${ref}.json`, import.meta.url), "utf8"))); } catch { plans.set(ref, null); }
  }
  return plans.get(ref);
};
const shapes = new Map<any, { room: any; flat: [number, number][][] }[]>();
const k = Math.cos((42.36 * Math.PI) / 180);
const flat = ([lat, lon]: [number, number]): [number, number] => [lon * 111_320 * k, lat * 111_320];
function inside(p: [number, number], ring: [number, number][]) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const roomsOn = (ref: string, level: number) => {
  const pl = plan(ref);
  const f = pl && Object.values<any>(pl.floors).find((f) => f.level === level);
  if (!f) return [];
  const open = new Set<string>(f.hallOpen ?? []);
  if (!shapes.has(f)) shapes.set(f, roomShapes(f.rooms.filter((r: any) => !SERVICE.test(r.u) && !CIRCULATION.test(r.u) && !open.has(r.n)), pl.outline).map(({ room, shapes }) => ({ room, flat: shapes.map((s) => s.map(flat)) })));
  return shapes.get(f)!;
};
const walkable = new Map<any, [number, number][][]>();
/** The floor's traced hallways, open floor and circulation, flat; undefined when the floor has none. */
const spacesOn = (ref: string, level: number) => {
  const pl = plan(ref);
  const f = pl && Object.values<any>(pl.floors).find((f) => f.level === level);
  if (!f) return undefined;
  if (!walkable.has(f)) walkable.set(f, [...(f.hall ?? []), ...(f.open ?? []), ...f.rooms.filter((r: any) => r.s && CIRCULATION.test(r.u)).map((r: any) => r.s)].map((ring: [number, number][]) => ring.map(flat)));
  return walkable.get(f)!.length ? walkable.get(f) : undefined;
};
const stem = (n: string) => n.replace(/[A-Z]+$/, "");
const bad: { link: string; metres: number; rooms: string[] }[] = [];
const off: { link: string; metres: number }[] = [];
const perBuilding = new Map<string, { links: number; crossing: number; off: number }>();
for (const l of campus.links) {
  const path: string | undefined = l[10];
  if (!path) continue;
  const a = places.get(l[0]), b = places.get(l[1]);
  const refs = [BUILDING.exec(a.name)?.[1], BUILDING.exec(b.name)?.[1]].filter((r): r is string => !!r);
  if (only.size && !refs.some((r) => only.has(r))) continue;
  const own = new Set([a, b].map((p) => p.name.split(" ")[0]));
  const suites = new Set([...own].map(stem));
  const all = [...new Set(refs)].flatMap((ref) => roomsOn(ref, a.floor).map((r) => ({ ...r, name: `${ref}-${r.room.n}` })));
  const rooms = all.filter((r) => !own.has(r.name) && !suites.has(stem(r.name)));
  const mine = all.filter((r) => own.has(r.name)).flatMap((r) => r.flat);
  const spaces = [...new Set(refs)].map((ref) => spacesOn(ref, a.floor));
  const floor = spaces.every((s) => s) ? spaces.flat() as [number, number][][] : undefined;
  const corners = path.split(" ").map((c) => flat(c.split(",").map(Number) as [number, number]));
  const indoors = a.kind !== "ENTRANCE" && b.kind !== "ENTRANCE"; // an entrance walk crosses the gap outside by design
  let hits = 0, total = 0, away = 0;
  const crossed = new Set<string>();
  for (let i = 1; i < corners.length; i++) {
    const [x0, y0] = corners[i - 1], [x1, y1] = corners[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.5));
    for (let s = 0; s < n; s++) {
      const p: [number, number] = [x0 + ((x1 - x0) * s) / n, y0 + ((y1 - y0) * s) / n];
      total++;
      const r = rooms.find((r) => r.flat.some((ring) => inside(p, ring)));
      if (r) { hits++; crossed.add(r.name); }
      if (floor && indoors && !floor.some((ring) => inside(p, ring)) && !mine.some((ring) => inside(p, ring))) away++;
    }
  }
  for (const ref of new Set(refs)) {
    const t = perBuilding.get(ref) ?? perBuilding.set(ref, { links: 0, crossing: 0, off: 0 }).get(ref)!;
    t.links++;
    if (hits * 0.5 > 3) t.crossing++;
    if (away * 0.5 > 3) t.off++;
  }
  if (hits * 0.5 > 3) bad.push({ link: `${a.name} -> ${b.name}`, metres: hits * 0.5, rooms: [...crossed] });
  if (away * 0.5 > 3) off.push({ link: `${a.name} -> ${b.name}`, metres: away * 0.5 });
}
bad.sort((x, y) => y.metres - x.metres);
off.sort((x, y) => y.metres - x.metres);
for (const b of bad.slice(0, 25)) console.log(`${b.metres.toFixed(0).padStart(4)} m through ${b.rooms.join(", ")}: ${b.link}`);
console.log(`\n${bad.length} connections run more than 3 m through rooms (of ${campus.links.filter((l: any) => l[10]).length} traced).`);
for (const [ref, t] of [...perBuilding].sort((x, y) => y[1].crossing - x[1].crossing).slice(0, 15)) console.log(`  ${ref}: ${t.crossing}/${t.links}`);
for (const o of off.slice(0, 10)) console.log(`${o.metres.toFixed(0).padStart(4)} m off the traced hallways: ${o.link}`);
console.log(`\n${off.length} connections run more than 3 m off the traced hallways, open floor and circulation.`);
for (const [ref, t] of [...perBuilding].sort((x, y) => y[1].off - x[1].off).slice(0, 10)) console.log(`  ${ref}: ${t.off}/${t.links}`);
