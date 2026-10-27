import { expect, test } from "bun:test";
import { corridorPath, trimSpurs, walkToward } from "../web/indoor.ts";

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

test("indoor line keeps to corridors over a room unless the corridor way is far longer (twenty times)", () => {
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

test("a walk to an unreachable place ends at the reachable open floor nearest it, within the given distance", () => {
  const k = Math.cos((42.36 * Math.PI) / 180);
  const ll = ([x, y]: [number, number]): [number, number] => [42.36 + y / 111_320, -71.09 + x / (111_320 * k)];
  const box = (x0: number, y0: number, x1: number, y1: number) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map((p) => ll(p as [number, number]));
  // A corridor along y 0-3, and a separate pocket (a hall's stage) at 20-24, 8-12 that the corridor cannot reach.
  const corridor = box(0, 0, 30, 3), pocket = box(20, 8, 24, 12);
  const hall = ll([22, 10]); // the hall's position, inside the pocket
  const w = walkToward([corridor, pocket], ll([1, 1.5]), hall, [], 15)!;
  const [lat, lon] = w.path[w.path.length - 1];
  const [x, y] = [(lon + 71.09) * 111_320 * k, (lat - 42.36) * 111_320];
  // It ends in the corridor, beside the hall (not in the unreachable pocket), about 7 m from the hall's position.
  expect(y).toBeLessThan(3.1);
  expect(Math.abs(x - 22)).toBeLessThan(1);
  expect(w.gap).toBeGreaterThan(6);
  // Without allowance it finds nothing; and the open floor must be within the distance given.
  expect(walkToward([corridor, pocket], ll([1, 1.5]), hall, [], 0)).toBeUndefined();
  expect(walkToward([corridor, pocket], ll([1, 1.5]), hall, [], 5)).toBeUndefined();
});

test("route line loses an overshoot that comes back along itself, but not across a change of floor", () => {
  const k = Math.cos((42.36 * Math.PI) / 180);
  const ll = (x: number, y = 0): [number, number] => [42.36 + y / 111_320, -71.09 + x / (111_320 * k)];
  // East from 0 to 20 m (a corridor's label), back west to a room at 10.5 m, 0.5 m off the way.
  const points = [ll(0), ll(10), ll(20), ll(10.5, 0.5)];
  const trimmed = trimSpurs(points, [0, 0, 0, 0], [0, 2, 3]);
  expect(trimmed.points).toEqual([ll(0), ll(10), ll(10.5, 0.5)]);
  expect(trimmed.reached).toEqual([0, 1, 2]); // the label's step now ends where the spur began
  // The same corners split across two floors (a lift at 20 m): nothing is cut.
  expect(trimSpurs(points, [0, 0, 1, 1], [0, 2, 3]).points).toEqual(points);
  // Building 13, floor 4: along a slanting corridor past the room to the label, back along it, then off to the room
  // 4 m beside it. The line now turns off the corridor where the walk back left it.
  const slant = [ll(-4.2, 5.4), ll(13.4, 13), ll(13.6, 13.2), ll(7.1, 9.2), ll(-2.2, 10.5)];
  const cut = trimSpurs(slant, [0, 0, 0, 0, 0], [1, 4]);
  expect(cut.points.length).toBe(4);
  expect(cut.points.slice(2)).toEqual([ll(7.1, 9.2), ll(-2.2, 10.5)]);
  expect(cut.reached).toEqual([1, 3]);
  // A real detour round a block is not a spur: it never comes back near itself.
  const round = [ll(0), ll(0, 10), ll(10, 10), ll(10)];
  expect(trimSpurs(round, [0, 0, 0, 0], [3]).points).toEqual(round);
});
