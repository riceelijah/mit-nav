// The route line indoors: between two places on one floor, a path through the floor's traced spaces, so the line keeps
// to the open floor instead of crossing walls. It prefers corridors, lobbies and open floor; other rooms cost more.

type LatLon = [number, number];
const CELL = 0.5; // metres per grid cell
const REACH = 4; // metres an end may be from the walkable area and still join it
const MARGIN = 40; // metres around the two ends searched for a path
const ROOM_COST = 20; // a step through a room that is not on the way costs this many steps along a corridor

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
  return walkToward(preferred, a, b, other, 0)?.path;
}

/**
 * Like corridorPath, but when `b` cannot be reached the path ends instead at the reached open floor nearest `b`, if that
 * is within `toward` metres of it; `gap` is how far that end is from `b` (0 when `b` itself is reached).
 */
export function walkToward(preferred: LatLon[][], a: LatLon, b: LatLon, other: LatLon[][], toward: number, base: LatLon[][] = []): { path: LatLon[]; gap: number } | undefined {
  if (!preferred.length && !base.length) return undefined;
  const k = Math.cos((a[0] * Math.PI) / 180);
  const flat = ([lat, lon]: LatLon): [number, number] => [(lon - a[1]) * 111_320 * k, (lat - a[0]) * 111_320];
  const back = ([x, y]: [number, number]): LatLon => [a[0] + y / 111_320, a[1] + x / (111_320 * k)];
  const fb = flat(b);
  const x0 = Math.min(0, fb[0]) - MARGIN, y0 = Math.min(0, fb[1]) - MARGIN;
  const w = Math.ceil((Math.abs(fb[0]) + 2 * MARGIN) / CELL), h = Math.ceil((Math.abs(fb[1]) + 2 * MARGIN) / CELL);
  const near = (rings: LatLon[][]) => rings.map((r) => r.map(flat)).filter((r) => r.some(([x, y]) => x >= x0 && x <= x0 + w * CELL && y >= y0 && y <= y0 + h * CELL));
  const good = near(preferred), rest = near(other), floor = near(base);
  const centre = (i: number, j: number): [number, number] => [x0 + (i + 0.5) * CELL, y0 + (j + 0.5) * CELL];
  // 0 closed, 1 preferred, ROOM_COST another room: each outline filled row by row (cells whose centres it holds).
  const open = new Uint8Array(w * h);
  const fill = (ring: [number, number][], value: number) => {
    const ys = ring.map(([, y]) => y);
    const j0 = Math.max(0, Math.ceil((Math.min(...ys) - y0) / CELL - 0.5)), j1 = Math.min(h - 1, Math.floor((Math.max(...ys) - y0) / CELL - 0.5));
    for (let j = j0; j <= j1; j++) {
      const y = y0 + (j + 0.5) * CELL, xs: number[] = [];
      for (let m = 0, n = ring.length - 1; m < ring.length; n = m++) {
        const [xi, yi] = ring[m], [xj, yj] = ring[n];
        if (yi > y !== yj > y) xs.push(((xj - xi) * (y - yi)) / (yj - yi) + xi);
      }
      xs.sort((p, q) => p - q);
      for (let e = 0; e + 1 < xs.length; e += 2) {
        const i0 = Math.max(0, Math.ceil((xs[e] - x0) / CELL - 0.5)), i1 = Math.min(w - 1, Math.ceil((xs[e + 1] - x0) / CELL - 0.5) - 1);
        for (let i = i0; i <= i1; i++) open[j * w + i] = value;
      }
    }
  };
  // `base` is the whole floor (the building outline), walkable wherever no room is: rooms over it are fattened by a
  // cell, so the cracks between approximate room shapes close while corridors stay open.
  for (const r of floor) fill(r, 1);
  for (const r of rest) fill(r, ROOM_COST);
  if (floor.length) {
    const grown = new Uint8Array(open);
    for (let c = 0; c < open.length; c++) {
      if (open[c] !== ROOM_COST) continue;
      const i = c % w, j = (c - i) / w;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = (j + dj) * w + i + di;
        if (i + di >= 0 && i + di < w && j + dj >= 0 && j + dj < h && open[n] === 1) grown[n] = ROOM_COST;
      }
    }
    open.set(grown);
  }
  for (const r of good) fill(r, 1);
  // Each end joins the walkable cell nearest it, within REACH.
  const snap = ([x, y]: [number, number]) => {
    const ci = Math.floor((x - x0) / CELL), cj = Math.floor((y - y0) / CELL), r = Math.ceil(REACH / CELL);
    let best = -1, bestD = Infinity;
    for (let j = Math.max(0, cj - r); j <= Math.min(h - 1, cj + r); j++)
      for (let i = Math.max(0, ci - r); i <= Math.min(w - 1, ci + r); i++) {
        const d = (i - ci) ** 2 + (j - cj) ** 2;
        if (open[j * w + i] && d < bestD && d <= r * r) [best, bestD] = [j * w + i, d];
      }
    return best;
  };
  const start = snap([0, 0]), goal = snap(fb);
  if (start < 0 || (goal < 0 && !toward)) return undefined;
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
  let end = goal >= 0 && from[goal] >= 0 ? goal : -1, gap = 0;
  if (end < 0) {
    // Not reachable: the reached open floor (never a room) nearest b, within `toward`.
    if (!toward) return undefined;
    let bestD = toward * toward;
    for (let c = 0; c < from.length; c++) {
      if (from[c] < 0 || open[c] !== 1) continue;
      const [x, y] = centre(c % w, Math.floor(c / w)), d = (x - fb[0]) ** 2 + (y - fb[1]) ** 2;
      if (d <= bestD) [end, bestD] = [c, d];
    }
    if (end < 0) return undefined;
    gap = Math.sqrt(bestD);
  }
  const cells: number[] = [];
  for (let c = end; c !== start; c = from[c]) cells.push(c);
  cells.push(start);
  cells.reverse();
  // Keep only the corners a straight line between them would not cut off: a cell is skipped while the walkable
  // area still holds a straight line from the last kept cell to the next.
  const walked = new Set(cells);
  const clear = (p: number, q: number) => {
    const [pi, pj] = [p % w, Math.floor(p / w)], [qi, qj] = [q % w, Math.floor(q / w)];
    const n = Math.max(Math.abs(qi - pi), Math.abs(qj - pj)) * 2;
    // A shortcut may not leave the open floor, nor cross a room except where the path itself went through it.
    for (let s = 0; s <= n; s++) {
      const c = Math.round(pj + ((qj - pj) * s) / n) * w + Math.round(pi + ((qi - pi) * s) / n);
      if (!open[c] || (open[c] > 1 && !walked.has(c))) return false;
    }
    return true;
  };
  const kept = [cells[0]];
  for (let i = 1; i < cells.length - 1; i++) if (!clear(kept[kept.length - 1], cells[i + 1])) kept.push(cells[i]);
  return { path: [...kept.slice(1), end].map((c) => back(centre(c % w, Math.floor(c / w)))), gap };
}

/** The point of `rings` nearest `p` within `reach` metres (on the half-metre grid), or undefined when none is that close. */
export function nearestOpen(rings: LatLon[][], p: LatLon, reach: number): LatLon | undefined {
  const k = Math.cos((p[0] * Math.PI) / 180);
  const flat = ([lat, lon]: LatLon): [number, number] => [(lon - p[1]) * 111_320 * k, (lat - p[0]) * 111_320];
  const near = rings.map((r) => r.map(flat)).filter((r) => r.some(([x, y]) => Math.abs(x) <= reach + 60 && Math.abs(y) <= reach + 60));
  let best: [number, number] | undefined, bestD = Infinity;
  for (let y = -reach; y <= reach; y += CELL)
    for (let x = -reach; x <= reach; x += CELL) {
      const d = x * x + y * y;
      if (d < bestD && d <= reach * reach && near.some((r) => inside([x, y], r))) [best, bestD] = [[x, y], d];
    }
  return best && [p[0] + best[1] / 111_320, p[1] + best[0] / (111_320 * k)];
}
