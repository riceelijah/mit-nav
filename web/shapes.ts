// Each room's drawn shape: its traced outline when it has one, else the part of the floor nearest its label (see roomShapes).
// Shared by the page (drawing) and the converter (the floor's walkable space is the outline minus these).
export type PlanRoom = { n: string; u: string; at: [number, number]; a: number; s?: [number, number][]; d?: [number, number][]; f?: 1 };
type Flat = [number, number];
/** Keeps the part of a polygon on the side of the line through `p` where (x - p) · n <= 0. */
function clip(poly: Flat[], p: Flat, n: Flat): Flat[] {
  const side = (q: Flat) => (q[0] - p[0]) * n[0] + (q[1] - p[1]) * n[1];
  const out: Flat[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const sa = side(a), sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
      const t = sa / (sa - sb);
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return out;
}
/**
 * Each room's shape: the part of the building outline nearer its label than any other room's on the floor,
 * cut to a square of 1.5 times its area around the label, turned to the outline's longest edge. With every
 * room present, these regions approximate the rooms; a room with no area keeps its whole region.
 */
export function roomShapes(rooms: PlanRoom[], outline: [number, number][][]) {
  const lat0 = outline[0]?.[0]?.[0] ?? 0;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const flat = ([lat, lon]: [number, number]): Flat => [lon * 111_320 * k, lat * 111_320];
  const back = ([x, y]: Flat): [number, number] => [y / 111_320, x / (111_320 * k)];
  const rings = outline.map((ring) => ring.map(flat));
  let axis = 0, longest = 0;
  for (const ring of rings)
    for (let i = 0; i + 1 < ring.length; i++) {
      const length = Math.hypot(ring[i + 1][0] - ring[i][0], ring[i + 1][1] - ring[i][1]);
      if (length > longest) [longest, axis] = [length, Math.atan2(ring[i + 1][1] - ring[i][1], ring[i + 1][0] - ring[i][0])];
    }
  const along: Flat = [Math.cos(axis), Math.sin(axis)], across: Flat = [-Math.sin(axis), Math.cos(axis)];
  const points = rooms.map((r) => flat(r.at));
  // ponytail: n² half-plane cuts per floor (a few hundred rooms); a Delaunay library if floors get much larger.
  return rooms.map((room, i) => {
    if (room.s) return { room, shapes: [room.d ?? room.s] };
    const p = points[i];
    const shapes = rings.map((ring) => {
      let poly = ring.slice(0, -1);
      for (let j = 0; j < points.length && poly.length; j++) {
        const q = points[j];
        if (j === i || (q[0] === p[0] && q[1] === p[1])) continue;
        poly = clip(poly, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], [q[0] - p[0], q[1] - p[1]]);
      }
      if (room.a > 0 && poly.length) {
        const half = Math.sqrt(1.5 * room.a) / 2;
        for (const [d, sign] of [[along, 1], [along, -1], [across, 1], [across, -1]] as const) {
          poly = clip(poly, [p[0] + sign * half * d[0], p[1] + sign * half * d[1]], [sign * d[0], sign * d[1]]);
        }
      }
      return poly.map(back);
    });
    return { room, shapes: shapes.filter((r) => r.length >= 3) };
  });
}
