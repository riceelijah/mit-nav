// Each room's drawn shape: its traced outline when it has one, else the part of the floor nearest its label (see roomShapes).
// Shared by the page (drawing) and the converter (the floor's walkable space is the outline minus these).
export type PlanRoom = { n: string; u: string; at: [number, number]; a: number; s?: [number, number][]; d?: [number, number][]; b?: [number, number][][]; f?: 1 };
type Flat = [number, number];
/**
 * Each room's shape: its traced outline when it has one, else a square of its floor area around its label, turned to
 * the building outline's longest edge (a room with no area gets 3 m by 3 m). Squares can overlap and leave gaps, which
 * is honest about what the inventory knows: a position and a size, not walls.
 */
export function roomShapes(rooms: PlanRoom[], outline: [number, number][][]) {
  const lat0 = outline[0]?.[0]?.[0] ?? 0;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const flat = ([lat, lon]: [number, number]): Flat => [lon * 111_320 * k, lat * 111_320];
  const back = ([x, y]: Flat): [number, number] => [y / 111_320, x / (111_320 * k)];
  let axis = 0, longest = 0;
  for (const ring of outline.map((r) => r.map(flat)))
    for (let i = 0; i + 1 < ring.length; i++) {
      const length = Math.hypot(ring[i + 1][0] - ring[i][0], ring[i + 1][1] - ring[i][1]);
      if (length > longest) [longest, axis] = [length, Math.atan2(ring[i + 1][1] - ring[i][1], ring[i + 1][0] - ring[i][0])];
    }
  const along: Flat = [Math.cos(axis), Math.sin(axis)], across: Flat = [-Math.sin(axis), Math.cos(axis)];
  return rooms.map((room) => {
    if (room.s) return { room, shapes: [room.d ?? room.s] };
    const [x, y] = flat(room.at), half = Math.sqrt(Math.max(room.a, 9)) / 2;
    const corner = (u: number, v: number): [number, number] => back([x + u * half * along[0] + v * half * across[0], y + u * half * along[1] + v * half * across[1]]);
    return { room, shapes: [[corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)]] };
  });
}
