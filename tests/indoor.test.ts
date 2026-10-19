import { expect, test } from "bun:test";
import { corridorPath } from "../web/indoor.ts";

test("indoor line follows an L-shaped corridor round its corner instead of cutting across", () => {
  // An L of two 3 m wide corridors, in metres around (42.36, -71.09): along x from 0 to 30, then up y from 0 to 30.
  const k = Math.cos((42.36 * Math.PI) / 180);
  const ll = ([x, y]: [number, number]): [number, number] => [42.36 + y / 111_320, -71.09 + x / (111_320 * k)];
  const along = [[0, 0], [30, 0], [30, 3], [0, 3]].map((p) => ll(p as [number, number]));
  const up = [[27, 0], [30, 0], [30, 30], [27, 30]].map((p) => ll(p as [number, number]));
  const path = corridorPath([along, up], ll([1, 1.5]), ll([28.5, 29]))!;
  expect(path).toBeDefined();
  // Every point stays within the L, and the path turns near the corner (28.5, 1.5).
  const xy = path.map(([lat, lon]) => [(lon + 71.09) * 111_320 * k, (lat - 42.36) * 111_320]);
  expect(xy.every(([x, y]) => (y <= 3.3 && x >= -0.3 && x <= 30.3) || (x >= 26.7 && x <= 30.3 && y <= 30.3))).toBe(true);
  expect(xy.some(([x, y]) => x > 26 && y < 4)).toBe(true);
  // Ends far from any corridor: no path.
  expect(corridorPath([along], ll([1, 1.5]), ll([15, 20]))).toBeUndefined();
});

test("indoor line keeps to corridors over a room unless the corridor way is more than four times longer", () => {
  const k = Math.cos((42.36 * Math.PI) / 180);
  const ll = ([x, y]: [number, number]): [number, number] => [42.36 + y / 111_320, -71.09 + x / (111_320 * k)];
  const box = (x0: number, y0: number, x1: number, y1: number) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map((p) => ll(p as [number, number]));
  // Two corridor stubs either side of a 10 m room, and a corridor loop round the room's top 6 m away.
  const left = box(0, 0, 3, 3), right = box(13, 0, 16, 3), room = box(3, 0, 13, 3), loop = box(0, 3, 16, 9);
  const xy = (p: [number, number][]) => p.map(([lat, lon]) => [(lon + 71.09) * 111_320 * k, (lat - 42.36) * 111_320]);
  // With the loop, the way round (about 1.4x the way through) wins: the line goes up into the loop.
  const round = xy(corridorPath([left, right, loop], ll([1.5, 1.5]), ll([14.5, 1.5]), [room])!);
  expect(round.some(([, y]) => y > 3)).toBe(true);
  // Without it, the only way is through the room, by its doors.
  const through = xy(corridorPath([left, right], ll([1.5, 1.5]), ll([14.5, 1.5]), [room])!);
  expect(through.every(([, y]) => y <= 3.3)).toBe(true);
  // A room left out (a recovered outline) is never passed through.
  expect(corridorPath([left, right], ll([1.5, 1.5]), ll([14.5, 1.5]))).toBeUndefined();
});
