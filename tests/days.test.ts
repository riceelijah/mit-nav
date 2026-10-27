import { expect, test } from "bun:test";
import { isHoliday, routeDay } from "../web/days.ts";

test("MIT holidays count as Sundays; other days keep their day of the week", () => {
  const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
  expect(routeDay(d(2026, 10, 26))).toBe(1); // a Monday
  expect(routeDay(d(2026, 10, 12))).toBe(0); // Indigenous Peoples' Day, second Monday of October
  expect(isHoliday(d(2026, 11, 26)) && isHoliday(d(2026, 11, 27))).toBe(true); // Thanksgiving and the day after
  expect(isHoliday(d(2026, 11, 25))).toBe(false);
  expect(isHoliday(d(2026, 5, 25))).toBe(true); // Memorial Day, last Monday of May
  expect(isHoliday(d(2026, 4, 20))).toBe(true); // Patriots' Day, third Monday of April
  expect(isHoliday(d(2026, 7, 3))).toBe(true); // 4 July 2026 is a Saturday: kept on the Friday
  expect(isHoliday(d(2027, 7, 5))).toBe(true); // 4 July 2027 is a Sunday: kept on the Monday
  expect(isHoliday(d(2026, 12, 28))).toBe(true); // winter break
  expect(isHoliday(d(2026, 12, 23))).toBe(false);
});
