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
