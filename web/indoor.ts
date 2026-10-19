// The route line indoors: between two places on one floor, a path through the floor's traced spaces, so the line keeps
// to the open floor instead of crossing walls. It prefers corridors, lobbies and open floor; other rooms cost more.

type LatLon = [number, number];
const CELL = 0.5; // metres per grid cell
const REACH = 4; // metres an end may be from the walkable area and still join it
const MARGIN = 40; // metres around the two ends searched for a path
const ROOM_COST = 4; // a step through a room that is not on the way costs this many steps along a corridor

/** Whether `p` is inside the polygon `ring` (even-odd rule). */
function inside(p: [number, number], ring: [number, number][]) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/**
 * The cheapest path from `a` to `b` inside `preferred` (corridors, open floor, the two places) or `other` traced rooms
 * (each step there costing ROOM_COST), as the corner points between them; undefined when either end is more than REACH
 * metres from them or no path joins them. Outlines are [lat, lon] rings.
 */
export function corridorPath(preferred: LatLon[][], a: LatLon, b: LatLon, other: LatLon[][] = []): LatLon[] | undefined {
  if (!preferred.length) return undefined;
  const k = Math.cos((a[0] * Math.PI) / 180);
  const flat = ([lat, lon]: LatLon): [number, number] => [(lon - a[1]) * 111_320 * k, (lat - a[0]) * 111_320];
  const back = ([x, y]: [number, number]): LatLon => [a[0] + y / 111_320, a[1] + x / (111_320 * k)];
  const fb = flat(b);
  const x0 = Math.min(0, fb[0]) - MARGIN, y0 = Math.min(0, fb[1]) - MARGIN;
  const w = Math.ceil((Math.abs(fb[0]) + 2 * MARGIN) / CELL), h = Math.ceil((Math.abs(fb[1]) + 2 * MARGIN) / CELL);
  const near = (rings: LatLon[][]) => rings.map((r) => r.map(flat)).filter((r) => r.some(([x, y]) => x >= x0 && x <= x0 + w * CELL && y >= y0 && y <= y0 + h * CELL));
  const good = near(preferred), rest = near(other);
  const centre = (i: number, j: number): [number, number] => [x0 + (i + 0.5) * CELL, y0 + (j + 0.5) * CELL];
  // 0 closed, 1 preferred, ROOM_COST another room.
  const open = new Uint8Array(w * h);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const c = centre(i, j);
      if (good.some((r) => inside(c, r))) open[j * w + i] = 1;
      else if (rest.some((r) => inside(c, r))) open[j * w + i] = ROOM_COST;
    }
  // Each end joins the walkable cell nearest it, within REACH.
  const snap = ([x, y]: [number, number]) => {
    const ci = Math.floor((x - x0) / CELL), cj = Math.floor((y - y0) / CELL), r = Math.ceil(REACH / CELL);
    let best = -1, bestD = Infinity;
    for (let j = Math.max(0, cj - r); j <= Math.min(h - 1, cj + r); j++)
      for (let i = Math.max(0, ci - r); i <= Math.min(w - 1, ci + r); i++) {
        const d = (i - ci) ** 2 + (j - cj) ** 2;
        if (open[j * w + i] === 1 && d < bestD && d <= r * r) [best, bestD] = [j * w + i, d];
      }
    return best;
  };
  const start = snap([0, 0]), goal = snap(fb);
  if (start < 0 || goal < 0) return undefined;
  // Dijkstra over the 8 neighbours (10 straight, 14 diagonal, times the cell's cost), with a binary heap.
  const from = new Int32Array(w * h).fill(-1);
  const cost = new Float64Array(w * h).fill(Infinity);
  cost[start] = 0;
  from[start] = start;
  const heap: [number, number][] = [[0, start]];
  const push = (e: [number, number]) => {
    heap.push(e);
    for (let k = heap.length - 1; k > 0; ) {
      const p = (k - 1) >> 1;
      if (heap[p][0] <= heap[k][0]) break;
      [heap[p], heap[k]] = [heap[k], heap[p]];
      k = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      for (let k = 0; ; ) {
        const l = 2 * k + 1, r = l + 1;
        let m = k;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, c] = pop();
    if (c === goal) break;
    if (d > cost[c]) continue;
    const ci = c % w, cj = (c - ci) / w;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const i = ci + di, j = cj + dj, n = j * w + i;
      if (i < 0 || j < 0 || i >= w || j >= h || !open[n]) continue;
      if (di && dj && !(open[cj * w + i] && open[j * w + ci])) continue; // no squeezing past a corner
      const next = d + (di && dj ? 14 : 10) * open[n];
      if (next < cost[n]) {
        cost[n] = next;
        from[n] = c;
        push([next, n]);
      }
    }
  }
  if (from[goal] < 0) return undefined;
  const cells: number[] = [];
  for (let c = goal; c !== start; c = from[c]) cells.push(c);
  cells.push(start);
  cells.reverse();
  // Keep only the corners a straight line between them would not cut off: a cell is skipped while the walkable
  // area still holds a straight line from the last kept cell to the next.
  const clear = (p: number, q: number) => {
    const [pi, pj] = [p % w, Math.floor(p / w)], [qi, qj] = [q % w, Math.floor(q / w)];
    const n = Math.max(Math.abs(qi - pi), Math.abs(qj - pj)) * 2;
    // A shortcut may not leave the open floor, nor cut through a room the path itself went around.
    const worst = Math.max(open[p], open[q]);
    for (let s = 0; s <= n; s++) {
      const v = open[Math.round(pj + ((qj - pj) * s) / n) * w + Math.round(pi + ((qi - pi) * s) / n)];
      if (!v || v > worst) return false;
    }
    return true;
  };
  const kept = [cells[0]];
  for (let i = 1; i < cells.length - 1; i++) if (!clear(kept[kept.length - 1], cells[i + 1])) kept.push(cells[i]);
  return [...kept.slice(1), goal].map((c) => back(centre(c % w, Math.floor(c / w))));
}
