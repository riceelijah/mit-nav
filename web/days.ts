// The day of the week a route is asked for, as Wayfinding counts it (0 Sunday to 6 Saturday), with MIT's holidays
// counted as Sundays: buildings are open to the public only on weekdays that are not holidays.

/** The `n`th (1-based; -1 the last) `weekday` (0 Sunday) of `month` (0 January) in `year`, as a day of the month. */
function nth(year: number, month: number, weekday: number, n: number) {
  if (n < 0) {
    const last = new Date(year, month + 1, 0);
    return last.getDate() - ((last.getDay() - weekday + 7) % 7);
  }
  return 1 + ((weekday - new Date(year, month, 1).getDay() + 7) % 7) + 7 * (n - 1);
}

/** Whether `d` is an MIT holiday (a fixed-date one on a weekend is kept the Friday before or the Monday after). */
export function isHoliday(d: Date) {
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  const on = (month: number, date: number) => m === month && day === date;
  const observed = (month: number, date: number) => {
    const w = new Date(y, month, date).getDay();
    const shift = w === 6 ? -1 : w === 0 ? 1 : 0;
    const o = new Date(y, month, date + shift);
    return o.getMonth() === m && o.getDate() === day && o.getFullYear() === y;
  };
  return (
    [[0, 1], [5, 19], [6, 4], [10, 11]].some(([month, date]) => observed(month, date)) ||
    on(0, nth(y, 0, 1, 3)) || // Martin Luther King Jr. Day
    on(1, nth(y, 1, 1, 3)) || // Presidents' Day
    on(3, nth(y, 3, 1, 3)) || // Patriots' Day
    on(4, nth(y, 4, 1, -1)) || // Memorial Day
    on(8, nth(y, 8, 1, 1)) || // Labor Day
    on(9, nth(y, 9, 1, 2)) || // Indigenous Peoples' Day
    on(10, nth(y, 10, 4, 4)) || on(10, nth(y, 10, 4, 4) + 1) || // Thanksgiving and the day after
    (m === 11 && day >= 24) // winter break
  );
}

/** The day to route for: `d`'s day of the week, or 0 (a Sunday) on an MIT holiday. */
export const routeDay = (d: Date) => (isHoliday(d) ? 0 : d.getDay());
