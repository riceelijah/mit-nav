// Audits the route lines in data/campus.json: every traced path is sampled each half metre, and samples that fall inside
// a room the walk should not cross (any room but corridors, lobbies, bridges, lounges and the connection's own two
// places, by its traced or schematic shape) are counted. Prints the worst connections and a total per building.
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
  if (!shapes.has(f)) shapes.set(f, roomShapes(f.rooms.filter((r: any) => !SERVICE.test(r.u) && !CIRCULATION.test(r.u)), pl.outline).map(({ room, shapes }) => ({ room, flat: shapes.map((s) => s.map(flat)) })));
  return shapes.get(f)!;
};
const bad: { link: string; metres: number; rooms: string[] }[] = [];
const perBuilding = new Map<string, { links: number; crossing: number }>();
for (const l of campus.links) {
  const path: string | undefined = l[10];
  if (!path) continue;
  const a = places.get(l[0]), b = places.get(l[1]);
  const refs = [BUILDING.exec(a.name)?.[1], BUILDING.exec(b.name)?.[1]].filter((r): r is string => !!r);
  if (only.size && !refs.some((r) => only.has(r))) continue;
  const own = new Set([a, b].map((p) => p.name.split(" ")[0]));
  const rooms = [...new Set(refs)].flatMap((ref) => roomsOn(ref, a.floor).map((r) => ({ ...r, name: `${ref}-${r.room.n}` })).filter((r) => !own.has(r.name)));
  const corners = path.split(" ").map((c) => flat(c.split(",").map(Number) as [number, number]));
  let hits = 0, total = 0;
  const crossed = new Set<string>();
  for (let i = 1; i < corners.length; i++) {
    const [x0, y0] = corners[i - 1], [x1, y1] = corners[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.5));
    for (let s = 0; s < n; s++) {
      const p: [number, number] = [x0 + ((x1 - x0) * s) / n, y0 + ((y1 - y0) * s) / n];
      total++;
      const r = rooms.find((r) => r.flat.some((ring) => inside(p, ring)));
      if (r) { hits++; crossed.add(r.name); }
    }
  }
  for (const ref of new Set(refs)) {
    const t = perBuilding.get(ref) ?? perBuilding.set(ref, { links: 0, crossing: 0 }).get(ref)!;
    t.links++;
    if (hits * 0.5 > 3) t.crossing++;
  }
  if (hits * 0.5 > 3) bad.push({ link: `${a.name} -> ${b.name}`, metres: hits * 0.5, rooms: [...crossed] });
}
bad.sort((x, y) => y.metres - x.metres);
for (const b of bad.slice(0, 25)) console.log(`${b.metres.toFixed(0).padStart(4)} m through ${b.rooms.join(", ")}: ${b.link}`);
console.log(`\n${bad.length} connections run more than 3 m through rooms (of ${campus.links.filter((l: any) => l[10]).length} traced).`);
for (const [ref, t] of [...perBuilding].sort((x, y) => y[1].crossing - x[1].crossing).slice(0, 15)) console.log(`  ${ref}: ${t.crossing}/${t.links}`);
