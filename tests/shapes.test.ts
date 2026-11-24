import { describe, expect, test } from "bun:test";
import { roomPieces, tidy } from "../web/shapes.ts";

// Rings in metres east (x) and north (y) of a point near MIT, as [lat, lon].
const LAT = 42.36, LON = -71.09, K = Math.cos((LAT * Math.PI) / 180);
const at = ([x, y]: [number, number]): [number, number] => [LAT + y / 111_320, LON + x / (111_320 * K)];
const metres = ([lat, lon]: [number, number]) => [Math.round((lon - LON) * 111_320 * K * 100) / 100, Math.round((lat - LAT) * 111_320 * 100) / 100];
const ring = (points: [number, number][]) => [...points, points[0]].map(at);

describe("tidy", () => {
  test("a room's doorway notch and the raster's teeth are cut off, leaving its corners", () => {
    const notched = ring([[0, 0], [4, 0], [4.02, 1], [3.98, 2], [4, 3], [4, 4], [2.5, 4], [2.5, 3.4], [1.5, 3.4], [1.5, 4], [0, 4]]);
    expect(tidy(notched).map(metres)).toEqual([[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]);
  });

  test("a plain rectangle and a small closet are left as they are", () => {
    const rectangle = ring([[0, 0], [6, 0], [6, 3], [0, 3]]);
    expect(tidy(rectangle)).toEqual(rectangle);
    const closet = ring([[0, 0], [1, 0], [1, 1], [0, 1]]);
    expect(tidy(closet)).toEqual(closet);
  });

  test("an L-shaped room keeps its inner corner, wider than a doorway", () => {
    const l = ring([[0, 0], [8, 0], [8, 3], [3, 3], [3, 8], [0, 8]]);
    expect(tidy(l).map(metres)).toEqual([[0, 0], [8, 0], [8, 3], [3, 3], [3, 8], [0, 8], [0, 0]]);
  });
});

describe("roomPieces", () => {
  const hall = { n: "123", u: "LECTURE HALL", at: at([0, 0]), a: 300 };
  test("open floor within an untraced hall is the hall's; open floor beyond it, or holding another room's label, is not", () => {
    const aisle = ring([[-6, 2], [6, 2], [6, 4], [-6, 4]]);
    const corridor = ring([[-40, 15], [40, 15], [40, 18], [-40, 18]]);
    const lobby = ring([[-3, -6], [3, -6], [3, -3], [-3, -3]]);
    const corner = { n: "100LB", u: "LOBBY", at: at([0, -4.5]), a: 18 };
    expect([...roomPieces([hall, corner], [aisle, corridor, lobby])]).toEqual([[0, "123"]]);
  });
  test("a piece holding only an untraced room's label (and a shaft's) is that room's, however far it reaches", () => {
    const gym = { n: "130", u: "ATHLETIC FACIL", at: at([0, 0]), a: 700 };
    const shaft = { n: "121Z", u: "SHAFT SPACE", at: at([25, 2]), a: 2 };
    const floor = ring([[-30, -8], [30, -8], [30, 8], [-30, 8]]);
    expect([...roomPieces([gym, shaft], [floor])]).toEqual([[0, "130"]]);
    // Nearly twice the room's area is more than the room: open floor around it, not the room.
    expect(roomPieces([{ ...gym, a: 500 }], [floor]).size).toBe(0);
  });
  test("a room traced at its size keeps no open floor", () => {
    const traced = { ...hall, s: ring([[-9, -9], [9, -9], [9, 9], [-9, 9]]) };
    expect(roomPieces([traced], [ring([[-6, 2], [6, 2], [6, 4], [-6, 4]])]).size).toBe(0);
  });
});
