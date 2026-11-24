// Outlines traced from MIT's drawings keep the raster's teeth and every doorway's notch. For drawing, each is tidied:
// small detours (in or out) are cut off where the outline comes back within a door's width, then near-straight runs
// of points are merged. Route lines keep the traced outlines as they are.

type LatLon = [number, number];
type Flat = [number, number];
const GAP = 1.3; // metres: a detour that returns within this distance is a notch or a tooth
const AREA = 2.5; // square metres: and holds no more than this
const SPAN = 10; // points a detour may have
const TOLERANCE = 0.2; // metres a merged point may stray from the straight line

const area = (ring: Flat[]) => {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return sum / 2;
};
const distance = (p: Flat, q: Flat) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/** Distance from `p` to the segment from `a` to `b`. */
function offLine(p: Flat, a: Flat, b: Flat) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/** Cuts off the detours an open ring (no repeated first point) makes and returns from within GAP. */
function cutDetours(ring: Flat[]) {
  let points = ring;
  for (let changed = true; changed && points.length > 4; ) {
    changed = false;
    const whole = Math.abs(area(points));
    for (let i = 0; i < points.length && !changed; i++) {
      // The longest detour from point i that qualifies, so a whole notch goes at once.
      for (let m = Math.min(SPAN, points.length - 3); m >= 2; m--) {
        const detour = Array.from({ length: m + 1 }, (_, k) => points[(i + k) % points.length]);
        if (distance(detour[0], detour[m]) > GAP) continue;
        const cut = Math.abs(area(detour));
        if (cut > AREA || cut > whole / 4) continue;
        let along = 0;
        for (let k = 0; k < m; k++) along += distance(detour[k], detour[k + 1]);
        if (along - distance(detour[0], detour[m]) < 0.3) continue;
        const drop = new Set(Array.from({ length: m - 1 }, (_, k) => (i + 1 + k) % points.length));
        points = points.filter((_, k) => !drop.has(k));
        changed = true;
        break;
      }
    }
  }
  return points;
}

/** Douglas-Peucker on an open ring, split at its two most distant points so the ends are corners. */
function simplify(ring: Flat[]) {
  if (ring.length <= 4) return ring;
  let far = 0;
  for (let i = 1; i < ring.length; i++) if (distance(ring[0], ring[i]) > distance(ring[0], ring[far])) far = i;
  const keep = new Set([0, far]);
  const run = (from: number, to: number) => {
    let worst = -1, worstD = TOLERANCE;
    for (let k = from + 1; k < to; k++) {
      const d = offLine(ring[k % ring.length], ring[from % ring.length], ring[to % ring.length]);
      if (d > worstD) [worst, worstD] = [k, d];
    }
    if (worst < 0) return;
    keep.add(worst % ring.length);
    run(from, worst);
    run(worst, to);
  };
  run(0, far);
  run(far, ring.length);
  return ring.filter((_, k) => keep.has(k));
}

/** A traced outline ([lat, lon], first point repeated last) tidied for drawing; unchanged when tidying would ruin it. */
export function tidy(ring: LatLon[]): LatLon[] {
  if (ring.length < 5) return ring;
  const [lat0, lon0] = ring[0], k = Math.cos((lat0 * Math.PI) / 180);
  const flat = ([lat, lon]: LatLon): Flat => [(lon - lon0) * 111_320 * k, (lat - lat0) * 111_320];
  const back = ([x, y]: Flat): LatLon => [lat0 + y / 111_320, lon0 + x / (111_320 * k)];
  const points = ring.map(flat);
  if (distance(points[0], points[points.length - 1]) < 1e-6) points.pop();
  const tidied = simplify(cutDetours(points));
  if (tidied.length < 3 || Math.abs(area(tidied)) < 0.8 * Math.abs(area(points))) return ring;
  return [...tidied, tidied[0]].map(back);
}

const tidied = new WeakMap<LatLon[], LatLon[]>();
/** tidy, remembered per outline (plans are redrawn on every move of the map). */
export function tidyOnce(ring: LatLon[]) {
  let t = tidied.get(ring);
  if (!t) tidied.set(ring, (t = tidy(ring)));
  return t;
}

/** Spaces that are never a room's own (passages, lifts, stairs), and closets and shafts, which are never drawn. */
const NOT_A_ROOM = /^(CORRIDOR|LOBBY|BRIDGE\/TUNNEL|PVT CIRCULATION|LOUNGE|ELEVATOR|STAIRWAY|SHAFT SPACE|ELECTRIC CLOSET|TELECOM CLOSET|UTILITY\/MECH RM|CUSTODIAL CLOSET)$/;
const UNDRAWN = /^(SHAFT SPACE|ELECTRIC CLOSET|TELECOM CLOSET|UTILITY\/MECH RM|CUSTODIAL CLOSET)$/;
type PlanRoom = { n: string; u: string; at: LatLon; a: number; s?: LatLon[] };
/**
 * The pieces of a floor's unlabelled open floor that are really part of a room the drawing did not trace whole (no
 * outline, or one under 60% of its recorded area): a lecture hall's aisles and rows, an apartment's inner rooms, a gym.
 * By index into `open`, with the room's number. A piece is the room's when no other room's label lies in it (closets'
 * and shafts' aside), and either the room's own label does and the piece is under 1.5 times the room's area, or, for a
 * room of 40 m² or more, nearly all of the piece lies within the room's reach of its label (a circle holding a square
 * of its area) and it is no bigger than the room.
 */
export function roomPieces(rooms: PlanRoom[], open: LatLon[][]): Map<number, string> {
  const pieces = new Map<number, string>();
  if (!open.length) return pieces;
  const [lat0, lon0] = open[0][0], k = Math.cos((lat0 * Math.PI) / 180);
  const flat = ([lat, lon]: LatLon): Flat => [(lon - lon0) * 111_320 * k, (lat - lat0) * 111_320];
  const rings = open.map((r) => r.map(flat));
  const sizes = rings.map((r) => Math.abs(area(r)));
  const labels = rooms.map((r) => flat(r.at));
  const holds = (p: Flat, ring: Flat[]) => {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  const someoneElse = (h: number, ring: Flat[]) => rooms.some((r, j) => j !== h && !UNDRAWN.test(r.u) && holds(labels[j], ring));
  const claimants = rooms
    .map((room, h) => ({ room, h }))
    .filter(({ room }) => !NOT_A_ROOM.test(room.u) && room.a > 0 && !(room.s && Math.abs(area(room.s.map(flat))) >= 0.6 * room.a));
  // The piece holding a room's own label first, so a big room nearby cannot take it by reach.
  for (const { room, h } of claimants)
    rings.forEach((ring, i) => {
      if (!pieces.has(i) && sizes[i] <= 1.5 * room.a && holds(labels[h], ring) && !someoneElse(h, ring)) pieces.set(i, room.n);
    });
  for (const { room, h } of claimants) {
    if (room.a < 40) continue;
    const reach = 0.75 * Math.sqrt(room.a), centre = labels[h];
    rings.forEach((ring, i) => {
      if (pieces.has(i) || sizes[i] > room.a) return;
      if (ring.filter((p) => distance(p, centre) <= reach).length < 0.9 * ring.length) return;
      if (!someoneElse(h, ring)) pieces.set(i, room.n);
    });
  }
  return pieces;
}
const pieceCache = new WeakMap<object, Map<number, string>>();
/** roomPieces for a plan floor, remembered per floor. */
export function roomPiecesOnce(floor: { rooms: PlanRoom[]; open?: LatLon[][] }) {
  let p = pieceCache.get(floor);
  if (!p) pieceCache.set(floor, (p = roomPieces(floor.rooms, floor.open ?? [])));
  return p;
}
