import { expect, test } from "bun:test";
import { mergeSteps, turnWord } from "../web/steps.ts";

test("outdoor steps split by street with turns; the entrance walk ends the outdoor step; corridors merge", () => {
  const at = (latitude: number, longitude: number) => ({ latitude, longitude });
  const raw = [
    { instruction: "Walk about 100 m outside.", ...at(42.36, -71.1), distance: 2 },
    { instruction: "Walk about 50 m outside along Vassar Street.", ...at(42.3609, -71.1), distance: 1 },
    { instruction: "Walk about 10 m outside along a crosswalk.", ...at(42.361, -71.1), distance: 1 },
    { instruction: "Walk about 5 m outside along Massachusetts Avenue.", ...at(42.36101, -71.1), distance: 1 }, // a corner: stays in the step
    { instruction: "Walk about 80 m outside along Main Street.", ...at(42.361, -71.099), distance: 1 }, // east after north: right
    { instruction: "Walk about 1 m to the entrance of Stata Center (Building 32).", kind: "ENTRANCE", ...at(42.361, -71.0989), distance: 1 },
    { instruction: "Go inside Stata Center (Building 32) to floor 1.", ...at(42.361, -71.0989), distance: 1 },
    { instruction: "Walk about 20 m along the corridor.", distance: 1 },
    { instruction: "Walk about 5 m along the corridor.", distance: 1 },
  ];
  const shown = mergeSteps(raw);
  expect(shown.map((s) => s.instruction)).toEqual([
    "Walk about 165 m along Vassar Street, crossing at the crosswalk.",
    "Turn right onto Main Street and walk about 81 m, to the entrance of Stata Center (Building 32).",
    "Go inside Stata Center (Building 32) to floor 1.",
    "Walk about 25 m along the corridors.",
  ]);
  expect(shown.map((s) => [s.step, s.upto, s.distance])).toEqual([[1, 3, 5], [2, 5, 2], [3, 6, 1], [4, 8, 2]]);
  expect(shown[1].kind).toBe("ENTRANCE");
  expect([turnWord(0, 10), turnWord(0, 40), turnWord(0, -90), turnWord(355, 5), turnWord(undefined, 5)]).toEqual(["Continue", "Turn slightly right", "Turn left", "Continue", ""]);
});
