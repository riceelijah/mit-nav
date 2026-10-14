import { MongoServerError, type Collection, type Db } from "mongodb";

export class DuplicatePlace extends Error {}
export class NoSuchPlace extends Error {}
export class NoSuchLink extends Error {}
export class AlreadyBlocked extends Error {}
export class NotBlocked extends Error {}

export type Kind = "ENTRANCE" | "HALLWAY" | "ROOM" | "TRANSIT";

interface PlaceDoc {
  _id: string;
  name: string;
  kind: Kind;
  floor: number;
  order: number;
}

interface LinkDoc {
  _id: string;
  order: number;
  source: string;
  destination: string;
  forward: string;
  backward: string;
  accessible: boolean;
  blocked: boolean;
  closedFrom: number;
  closedUntil: number;
  service: string;
  distance: number;
}

/** Closed from `from` up to `until`, wrapping past midnight; equal values mean never closed. */
function isClosed(from: number, until: number, hour: number) {
  if (from === until) return false;
  return from < until ? hour >= from && hour < until : hour >= from || hour < until;
}

export class WayfindingConcept {
  private readonly places: Collection<PlaceDoc>;
  private readonly links: Collection<LinkDoc>;
  private indexed = false;

  constructor(db: Db) {
    this.places = db.collection<PlaceDoc>("wayfinding.places");
    this.links = db.collection<LinkDoc>("wayfinding.links");
  }

  async addPlace({ name, kind, floor }: { name: string; kind: Kind; floor: number }) {
    if (!this.indexed) {
      // The unique index is what stops two places from sharing a name, even in a race.
      await this.places.createIndex({ name: 1 }, { unique: true });
      this.indexed = true;
    }
    const place = crypto.randomUUID();
    try {
      const order = await this.places.countDocuments({});
      await this.places.insertOne({ _id: place, name, kind, floor, order });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new DuplicatePlace("A place with that name already exists.");
      }
      throw error;
    }
    return { place };
  }

  async connect({
    source,
    destination,
    forward,
    backward,
    accessible,
    closedFrom,
    closedUntil,
    service,
    distance,
  }: {
    source: string;
    destination: string;
    forward: string;
    backward: string;
    accessible: boolean;
    closedFrom: number;
    closedUntil: number;
    service: string;
    distance: number;
  }) {
    const found = await this.places.countDocuments({ _id: { $in: [source, destination] } });
    const needed = source === destination ? 1 : 2;
    if (found !== needed) {
      throw new NoSuchPlace("Both places must exist before they can be connected.");
    }
    const link = crypto.randomUUID();
    const order = await this.links.countDocuments({});
    await this.links.insertOne({
      _id: link,
      order,
      source,
      destination,
      forward,
      backward,
      accessible,
      blocked: false,
      closedFrom,
      closedUntil,
      service,
      distance,
    });
    return { link };
  }

  async block({ link }: { link: string }) {
    const existing = await this.links.findOne({ _id: link });
    if (!existing) throw new NoSuchLink("There is no such connection.");
    if (existing.blocked) throw new AlreadyBlocked("That connection is already blocked.");
    await this.links.updateOne({ _id: link }, { $set: { blocked: true } });
    // Everything that depends on the same service goes out with it.
    if (existing.service) await this.links.updateMany({ service: existing.service }, { $set: { blocked: true } });
    return { link };
  }

  async unblock({ link }: { link: string }) {
    const existing = await this.links.findOne({ _id: link });
    if (!existing) throw new NoSuchLink("There is no such connection.");
    if (!existing.blocked) throw new NotBlocked("That connection is not blocked.");
    await this.links.updateOne({ _id: link }, { $set: { blocked: false } });
    if (existing.service) await this.links.updateMany({ service: existing.service }, { $set: { blocked: false } });
    return { link };
  }

  async _places(_input: Record<string, never>) {
    const rows = await this.places.find({}).toArray();
    return rows
      .sort((a, b) => a.floor - b.floor || (a.order ?? 0) - (b.order ?? 0))
      .map(({ _id, name, kind, floor }) => ({ place: _id, name, kind, floor }));
  }

  async _links(_input: Record<string, never>) {
    const places = new Map((await this.places.find({}).toArray()).map((p) => [p._id, p.name]));
    const rows = await this.links.find({}).toArray();
    return rows
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        link: l._id,
        sourceName: places.get(l.source) ?? "?",
        destinationName: places.get(l.destination) ?? "?",
        forward: l.forward,
        accessible: l.accessible,
        blocked: l.blocked,
        closedFrom: l.closedFrom ?? 0,
        closedUntil: l.closedUntil ?? 0,
        service: l.service ?? "",
      }));
  }

  async _route({
    source,
    destination,
    accessibleOnly,
    hour,
  }: {
    source: string;
    destination: string;
    accessibleOnly: boolean;
    hour: number;
  }) {
    const places = new Map((await this.places.find({}).toArray()).map((p) => [p._id, p]));
    if (!places.has(source) || !places.has(destination) || source === destination) return [];
    const links = (await this.links.find({}).toArray()).sort((a, b) => a.order - b.order);

    // Dijkstra finds the shortest route. Each connection costs the distance it was given when it was made.
    // Blocked connections and ones closed at this hour are never used, and neither are inaccessible ones when asked to avoid them.
    const usable = links.filter(
      (l) => !l.blocked && !isClosed(l.closedFrom ?? 0, l.closedUntil ?? 0, hour) && (!accessibleOnly || l.accessible),
    );
    const next = new Map<string, { link: LinkDoc; to: string; instruction: string }[]>();
    for (const l of usable) {
      (next.get(l.source) ?? next.set(l.source, []).get(l.source)!).push({ link: l, to: l.destination, instruction: l.forward });
      (next.get(l.destination) ?? next.set(l.destination, []).get(l.destination)!).push({ link: l, to: l.source, instruction: l.backward });
    }
    const dist = new Map<string, number>([[source, 0]]);
    const came = new Map<string, { from: string; link: LinkDoc; instruction: string }>();
    const done = new Set<string>();
    const discovered: string[] = [source];
    for (;;) {
      // Pick the unfinished place with the smallest distance, earliest discovered first on ties.
      let here: string | undefined;
      for (const id of discovered) {
        if (done.has(id)) continue;
        if (here === undefined || dist.get(id)! < dist.get(here)!) here = id;
      }
      if (here === undefined || here === destination) break;
      done.add(here);
      for (const edge of next.get(here) ?? []) {
        if (done.has(edge.to)) continue;
        const candidate = dist.get(here)! + (edge.link.distance ?? 1);
        if (!dist.has(edge.to)) discovered.push(edge.to);
        if (!dist.has(edge.to) || candidate < dist.get(edge.to)!) {
          dist.set(edge.to, candidate);
          came.set(edge.to, { from: here, link: edge.link, instruction: edge.instruction });
        }
      }
    }
    if (!came.has(destination)) return [];

    const path: { link: LinkDoc; instruction: string; place: PlaceDoc }[] = [];
    for (let at = destination; at !== source; ) {
      const step = came.get(at)!;
      path.unshift({ link: step.link, instruction: step.instruction, place: places.get(at)! });
      at = step.from;
    }
    return path.map(({ link, instruction, place }, index) => ({
      step: index + 1,
      link: link._id,
      instruction,
      placeName: place.name,
      floor: place.floor,
    }));
  }
}
