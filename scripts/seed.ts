// Fills an empty database with the Simmons Hall map and the generated campus map through the public API.
// Run it once with the backend up: bun scripts/seed.ts
import { readFileSync } from "node:fs";

const base = process.env.API_URL ?? "http://127.0.0.1:3000/api";
const maps = ["simmons.json", "campus.json"].map((file) =>
  JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8")),
);

async function post(path: string, body: object) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as any;
}

// Simmons' hand-made map has no positions, so its places share Simmons Hall's from the campus map.
const simmonsHall = maps[1].places.find((p: any) => p.name.endsWith("(Building W79)"));
for (const place of maps[0].places) {
  place.latitude ??= simmonsHall?.latitude ?? 0;
  place.longitude ??= simmonsHall?.longitude ?? 0;
}

// The campus map links to Simmons places by name, so every place is added before any connection.
const ids = new Map<string, string>();
for (const place of maps.flatMap((m) => m.places)) {
  const result = await post("/map/add-place", place);
  if (result.error) console.log(`skip ${place.name}: ${result.error}`);
  else ids.set(place.name, result.place);
}
if (ids.size === 0) {
  console.log("Nothing added. The map is probably already seeded (run `bun run db:reset` to start over).");
  process.exit(0);
}
const links = maps.flatMap((m) => m.links);
for (const [source, destination, forward, backward, accessible, closedFrom = 0, closedUntil = 0, service = "", distance = 1] of links) {
  const result = await post("/map/connect", {
    source: ids.get(source),
    destination: ids.get(destination),
    forward,
    backward,
    accessible,
    closedFrom,
    closedUntil,
    service,
    distance,
  });
  if (result.error) console.log(`failed ${source} to ${destination}: ${result.error}`);
}
console.log(`Seeded ${ids.size} places and ${links.length} connections.`);
