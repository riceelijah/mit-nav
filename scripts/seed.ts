// Writes the generated campus map (data/campus.json) into the database, or updates a map already there in place.
// Run it while the app is stopped: bun scripts/seed.ts. Running it twice with the same map changes nothing.
//
// - A place keeps its identity while its name is unchanged, so favorites, trips and history that refer to it keep working.
// - A connection keeps its identity, and whether it is blocked, while it joins the same two places in the same direction
//   with the same directions apart from their metres; a new ride of an elevator that is out starts blocked.
// - Places and connections no longer in the map are removed, with the favorites and saved trips of removed places;
//   then every open report on a connection no longer in the map is resolved.
import { readFileSync } from "node:fs";
import type { Db } from "mongodb";

type Link = [string, string, string, string, boolean, number?, number?, string?, number?, boolean?, string?];
export type CampusMap = { places: { name: string; kind: string; floor: number; latitude: number; longitude: number }[]; links: Link[] };

export async function seed(database: Db, map: CampusMap) {
  const places = database.collection<any>("wayfinding.places");
  const links = database.collection<any>("wayfinding.links");
  await places.createIndex({ name: 1 }, { unique: true });

  const known = new Map((await places.find({}, { projection: { name: 1 } }).toArray()).map((p) => [p.name, p._id as string]));
  const ids = new Map<string, string>();
  const placeWrites = map.places.map((p, order) => {
    const _id = known.get(p.name) ?? crypto.randomUUID();
    ids.set(p.name, _id);
    const { name, kind, floor, latitude, longitude } = p;
    return { updateOne: { filter: { _id }, update: { $set: { name, kind, floor, latitude, longitude, order } }, upsert: true } };
  });
  if (placeWrites.length) await places.bulkWrite(placeWrites, { ordered: false });

  const key = (source: string, destination: string, forward: string) => `${source}|${destination}|${forward.replace(/\d+/g, "#")}`;
  const existing = new Map<string, any[]>();
  for (const l of await links.find({}).toArray()) {
    const k = key(l.source, l.destination, l.forward);
    existing.set(k, [...(existing.get(k) ?? []), l]);
  }
  const outServices = new Set((await links.find({ blocked: true, service: { $ne: "" } }).toArray()).map((l) => l.service));
  const kept = new Set<string>();
  const linkWrites = map.links.map(([from, to, forward, backward, accessible, closedFrom = 0, closedUntil = 0, service = "", distance = 1, outdoor = false, path = ""], order) => {
    const source = ids.get(from)!, destination = ids.get(to)!;
    const old = existing.get(key(source, destination, forward))?.shift(); // each old connection is matched at most once
    const _id = old?._id ?? crypto.randomUUID();
    kept.add(_id);
    const blocked = old ? old.blocked : outServices.has(service);
    const fields = { order, source, destination, forward, backward, accessible, outdoor, blocked, closedFrom, closedUntil, service, distance, path };
    return { updateOne: { filter: { _id }, update: { $set: fields }, upsert: true } };
  });
  if (linkWrites.length) await links.bulkWrite(linkWrites, { ordered: false });

  const gone = [...known].filter(([name]) => !ids.has(name)).map(([, id]) => id);
  await links.deleteMany({ _id: { $nin: [...kept] } });
  await places.deleteMany({ _id: { $in: gone } });
  await database.collection("favoriting.favorites").deleteMany({ item: { $in: gone } });
  await database.collection("planning.trips").deleteMany({ $or: [{ source: { $in: gone } }, { destination: { $in: gone } }] });
  // Every run, so a run that stopped partway leaves nothing open on a passage that is gone.
  const resolved = await database.collection("reporting.reports").updateMany({ status: "OPEN", target: { $nin: [...kept] } }, { $set: { status: "RESOLVED" } });
  return { places: ids.size, links: kept.size, removedPlaces: gone.length, resolvedReports: resolved.modifiedCount };
}

if (import.meta.main) {
  const { client, db } = await import("../src/db.ts");
  const result = await seed(db, JSON.parse(readFileSync(new URL("../data/campus.json", import.meta.url), "utf8")));
  console.log(`Map has ${result.places} places and ${result.links} connections; removed ${result.removedPlaces} places, resolved ${result.resolvedReports} reports.`);
  await client.close();
}
