// Turns the floor-plan description (data/simmons.floorplan.json) into the map the app loads
// (data/simmons.json): places and connections with directions, a step-free flag and closing hours.
// Usage: bun run floorplan
import { readFileSync, writeFileSync } from "node:fs";

const plan = JSON.parse(readFileSync(new URL("../data/simmons.floorplan.json", import.meta.url), "utf8"));
type Place = { name: string; kind: "ENTRANCE" | "HALLWAY" | "ROOM" | "TRANSIT"; floor: number };
// source, destination, forward, backward, accessible, closedFrom, closedUntil (equal means never closed), service, distance
type Link = [string, string, string, string, boolean, number, number, string, number];

// Rough effort: walking a connection costs 1, a flight of stairs 2 (so stairs beat waiting for an
// elevator for one or two floors, and the elevator wins from three), and an elevator ride 3.5 for the wait plus half a unit per floor.
const WALK = 1;
// A room with two doors is a destination, not a shortcut between levels, so cutting through it costs a lot.
const ROOM_DOOR = 6;
const STAIRS_PER_FLIGHT = 2;
const elevatorRide = (floors: number) => 3.5 + 0.5 * floors;
const places: Place[] = [];
const links: Link[] = [];

const levels: number[] = Object.keys(plan.levels).map(Number).sort((a, b) => a - b);
const sectionName = (level: number, section: string) =>
  level === 0 ? `Basement ${section}` : `${level}${section}`;
const sectionOf = (level: number, tower: string) => {
  const section = plan.levels[level].sections.find((s: string) => s.includes(tower));
  if (!section) throw new Error(`No section of level ${level} contains tower ${tower}`);
  return sectionName(level, section);
};
const where = (level: number) => plan.levels[level].label;
const hidden = new Set<string>(plan.hiddenSections ?? []);

for (const level of levels) {
  for (const section of plan.levels[level].sections) {
    const name = sectionName(level, section);
    places.push({ name, kind: hidden.has(name) ? "TRANSIT" : "HALLWAY", floor: level });
  }
}

// Each tower's elevator runs directly between every pair of floors it serves, opening onto whichever
// section of the floor contains that tower. All rides of one elevator share a service, so flagging
// any one of them takes the whole elevator out.
// Equal-cost routes go to whichever link was made first, so make the towers nearest the lobby first.
const towerOrder: string[] = plan.towerOrder ?? plan.towers;
const skipped = (tower: string, level: number) =>
  (plan.elevatorSkips ?? []).some((s: any) => s.tower === tower && s.level === level);
for (const tower of towerOrder) {
  const service = `${tower} elevator (${plan.elevators[tower]})`;
  const served = levels.filter((level) => !skipped(tower, level));
  for (let i = 0; i < served.length; i++) {
    for (let j = i + 1; j < served.length; j++) {
      const lo = served[i], hi = served[j];
      links.push([
        sectionOf(lo, tower),
        sectionOf(hi, tower),
        `Take the ${tower} elevator up to ${where(hi)} (${sectionOf(hi, tower)}).`,
        `Take the ${tower} elevator down to ${where(lo)} (${sectionOf(lo, tower)}).`,
        true, 0, 0, service, elevatorRide(hi - lo),
      ]);
    }
  }
}
// Each tower has its own stairs between neighbouring floors. They are not step-free.
for (let i = 0; i + 1 < levels.length; i++) {
  const lo = levels[i], hi = levels[i + 1];
  for (const tower of towerOrder) {
    if ((plan.stairSkips ?? []).some((k: any) => k.tower === tower && (k.level === lo || k.level === hi))) continue;
    links.push([
      sectionOf(lo, tower),
      sectionOf(hi, tower),
      `Take the ${tower} stairs up to ${where(hi)}.`,
      `Take the ${tower} stairs down to ${where(lo)}.`,
      false, 0, 0, "", STAIRS_PER_FLIGHT,
    ]);
  }
}
for (const e of plan.entrances) {
  places.push({ name: e.name, kind: "ENTRANCE", floor: e.level });
  links.push([e.name, sectionName(e.level, e.section), e.in, e.out, e.accessible, 0, 0, "", WALK]);
}
for (const t of plan.terraces) {
  places.push({ name: t.name, kind: "ROOM", floor: t.level });
  for (const section of t.from) {
    const from = sectionName(t.level, section);
    links.push([
      from, t.name,
      `Go through the terrace door from ${from} onto the terrace.`,
      `Go back inside through the terrace door to ${from}.`,
      t.accessible, t.closedFrom, t.closedUntil, "", WALK,
    ]);
  }
}
for (const r of plan.rooms) {
  places.push({ name: r.name, kind: "ROOM", floor: r.level });
  links.push([
    sectionName(r.level, r.section), r.name,
    r.in ?? `Walk to ${r.name}.`,
    r.out ?? `Leave ${r.name} and return to the corridor.`,
    true, 0, 0, "", WALK,
  ]);
}
// A room with several doors, possibly on different levels (such as the MPR), is one place.
for (const r of plan.multiRooms ?? []) {
  places.push({ name: r.name, kind: "ROOM", floor: r.level });
  for (const door of r.doors) {
    links.push([
      sectionName(door.level, door.section), r.name,
      `Go in through door ${door.label} to the ${r.name.split(" (")[0]}.`,
      `Leave through door ${door.label} back to ${sectionName(door.level, door.section)}.`,
      door.accessible, 0, 0, "", ROOM_DOOR,
    ]);
  }
}

writeFileSync(
  new URL("../data/simmons.json", import.meta.url),
  JSON.stringify({ note: "Generated from simmons.floorplan.json. Do not edit by hand.", places, links }, null, 2) + "\n",
);
console.log(`Wrote ${places.length} places and ${links.length} connections to data/simmons.json`);
