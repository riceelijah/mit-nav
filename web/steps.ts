// Route steps as the page shows them: corridor walks in a row as one step; outdoor walks along the same street as
// one step, with the turn where the street changes; and the walk to a building's door as the end of the outdoor step.

const CORRIDOR = /^Walk about (\d+) m along the corridors?\.$/;
const OUTSIDE = /^Walk about (\d+) m outside(?: along (.+))?\.$/;
const ENTRANCE = /^Walk about (\d+) m to the entrance of (.+)\.$/;
const CROSSWALK = "a crosswalk";
const SHORT = 20; // metres along another street that stay part of the current step

/** Compass heading in degrees from one [lat, lon] to another; undefined when either has no position. */
function heading(a: any, b: any) {
  if (!a || !b || !(a.latitude || a.longitude) || !(b.latitude || b.longitude)) return undefined;
  const east = (b.longitude - a.longitude) * Math.cos((a.latitude * Math.PI) / 180);
  const north = b.latitude - a.latitude;
  return east || north ? (Math.atan2(east, north) * 180) / Math.PI : undefined;
}

/** The turn from one heading to the next: straight on, slight, or full, to the left or right. */
export function turnWord(from: number | undefined, to: number | undefined) {
  if (from === undefined || to === undefined) return "";
  const d = ((to - from + 540) % 360) - 180; // -180..180, positive is clockwise (right)
  if (Math.abs(d) < 20) return "Continue";
  return `Turn ${Math.abs(d) < 60 ? "slightly " : ""}${d > 0 ? "right" : "left"}`;
}

function outdoorText(s: { meters: number; street: string; crossing: boolean; turn: string; entrance: string }) {
  const lead = s.turn && s.street ? `${s.turn} onto ${s.street} and walk` : "Walk";
  return `${lead} about ${s.meters} m${s.street && !s.turn ? ` along ${s.street}` : s.street ? "" : " outside"}` +
    `${s.crossing ? ", crossing at the crosswalk" : ""}${s.entrance ? `, to the entrance of ${s.entrance}` : ""}.`;
}

export function mergeSteps(steps: any[]) {
  const shown: any[] = [];
  // `upto` is the index of the last raw step a shown step covers, so the map can split the line at it.
  steps.forEach((s, upto) => {
    const prev = shown[shown.length - 1];
    const corridor = CORRIDOR.exec(s.instruction), outside = OUTSIDE.exec(s.instruction), door = ENTRANCE.exec(s.instruction);
    // Keep the first connection (that is the one flagged) and arrive where the last one does.
    const absorb = (into: any, more: object) => Object.assign(into, { ...s, link: into.link, distance: into.distance + s.distance, upto, ...more });
    if (corridor && prev?.merge === "corridor") {
      const meters = prev.meters + Number(corridor[1]);
      absorb(prev, { meters, instruction: `Walk about ${meters} m along the corridors.`, merge: "corridor" });
    } else if (door && prev?.merge === "outside") {
      // Reaching the door ends the outdoor step, so arriving at the entrance is part of it (and can tick it off).
      Object.assign(prev, { meters: prev.meters + Number(door[1]), entrance: door[2] });
      absorb(prev, { meters: prev.meters, instruction: outdoorText(prev), merge: "" });
    } else if (outside) {
      const name = outside[2] ?? "", crossing = name === CROSSWALK, street = crossing ? "" : name;
      // A few metres along another street (crossing it, or a corner) is not a new step.
      if (prev?.merge === "outside" && (!street || !prev.street || street === prev.street || Number(outside[1]) < SHORT)) {
        Object.assign(prev, { meters: prev.meters + Number(outside[1]), street: prev.street || street, crossing: prev.crossing || crossing });
        absorb(prev, { meters: prev.meters, instruction: outdoorText(prev), merge: "outside" });
      } else {
        // A new street: the turn is the change in heading where this walk starts.
        const turn = prev?.merge === "outside" ? turnWord(heading(steps[upto - 2], steps[upto - 1]), heading(steps[upto - 1], s)) : "";
        const step = { ...s, merge: "outside", meters: Number(outside[1]), street, crossing, turn, entrance: "", upto };
        shown.push({ ...step, instruction: outdoorText(step) });
      }
    } else {
      shown.push({ ...s, merge: corridor ? "corridor" : "", meters: Number(corridor?.[1] ?? 0), upto });
    }
  });
  return shown.map((s, i) => ({ ...s, step: i + 1 }));
}

