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
  latitude: number;
  longitude: number;
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
  outdoor?: boolean; // links made before outdoor existed are indoors
  blocked: boolean;
  closedFrom: number;
  closedUntil: number;
  service: string;
  distance: number;
}

const SEARCH_LIMIT = 40;
const CLOSEST = 5;
// Preferring indoors makes each outdoor connection cost this many times its distance.
const OUTDOOR_FACTOR = 3;
// Building and room numbers sort the way people read them: 2 before 10, 32-123 before 32-G904.
const byName = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

/** Closed from `from` up to `until`, wrapping past midnight; equal values mean never closed. */
function isClosed(from: number, until: number, hour: number) {
  if (from === until) return false;
  return from < until ? hour >= from && hour < until : hour >= from || hour < until;
}

/** Distance along the ground in metres; flat-earth is exact enough across a campus. */
export function groundMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const metersPerDegree = 111_320;
  const x = (lon2 - lon1) * metersPerDegree * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const y = (lat2 - lat1) * metersPerDegree;
  return Math.hypot(x, y);
}

/** A connection as people read it: its two places by name, its directions, and its service. */
async function describe(places: Collection<PlaceDoc>, l: LinkDoc) {
  const [source, destination] = await Promise.all([places.findOne({ _id: l.source }), places.findOne({ _id: l.destination })]);
  return { sourceName: source?.name ?? "?", destinationName: destination?.name ?? "?", forward: l.forward, service: l.service ?? "" };
}

/**
 * Dijkstra from `source` until `stop` says to: the cheapest cost to each place reached, how it was reached,
 * and the places in the order they were settled (cheapest first, earliest discovered on a tie).
 */
function cheapest(links: LinkDoc[], source: string, accessibleOnly: boolean, indoorsPreferred: boolean, hour: number, stop: (place: string) => boolean) {
  const settled: string[] = [];
  // Dijkstra finds the cheapest route. Each connection costs the distance it was given when it was made.
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
  // Binary heap of [distance, discovery order, place]: the smallest distance comes out first, and the
  // place discovered earliest wins a tie, so ties still go to connections made earlier.
  const order = new Map<string, number>([[source, 0]]);
  const heap: [number, number, string][] = [[0, 0, source]];
  const less = (a: [number, number, string], b: [number, number, string]) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const push = (item: [number, number, string]) => {
    heap.push(item);
    for (let i = heap.length - 1; i > 0; ) {
      const parent = (i - 1) >> 1;
      if (!less(heap[i], heap[parent])) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, , here] = pop();
    if (done.has(here) || d > dist.get(here)!) continue; // a stale entry for a place already improved
    settled.push(here);
    if (stop(here)) break;
    done.add(here);
    for (const edge of next.get(here) ?? []) {
      if (done.has(edge.to)) continue;
      const candidate = d + (edge.link.distance ?? 1) * (indoorsPreferred && edge.link.outdoor ? OUTDOOR_FACTOR : 1);
      if (!order.has(edge.to)) order.set(edge.to, order.size);
      if (!dist.has(edge.to) || candidate < dist.get(edge.to)!) {
        dist.set(edge.to, candidate);
        came.set(edge.to, { from: here, link: edge.link, instruction: edge.instruction });
        push([candidate, order.get(edge.to)!, edge.to]);
      }
    }
  }
  return { dist, came, settled };
}

export class WayfindingConcept {
  private readonly places: Collection<PlaceDoc>;
  private readonly links: Collection<LinkDoc>;
  private indexed = false;

  constructor(db: Db) {
    this.places = db.collection<PlaceDoc>("wayfinding.places");
    this.links = db.collection<LinkDoc>("wayfinding.links");
  }

  async addPlace({ name, kind, floor, latitude, longitude }: { name: string; kind: Kind; floor: number; latitude: number; longitude: number }) {
    if (!this.indexed) {
      // The unique index is what stops two places from sharing a name, even in a race.
      await this.places.createIndex({ name: 1 }, { unique: true });
      this.indexed = true;
    }
    const place = crypto.randomUUID();
    try {
      const order = await this.places.countDocuments({});
      await this.places.insertOne({ _id: place, name, kind, floor, latitude, longitude, order });
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
    outdoor,
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
    outdoor: boolean;
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
      outdoor,
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

  async _place({ place }: { place: string }) {
    const found = await this.places.findOne({ _id: place });
    return found ? [{ name: found.name, kind: found.kind, floor: found.floor, latitude: found.latitude ?? 0, longitude: found.longitude ?? 0 }] : [];
  }

  async _nearest({ latitude, longitude }: { latitude: number; longitude: number }) {
    if (!(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)) return [];
    const rows = (await this.places.find({ kind: "ENTRANCE" }).toArray())
      .filter((p) => p.latitude || p.longitude)
      .sort((a, b) => a.order - b.order);
    let best: PlaceDoc | undefined;
    let bestMeters = Infinity;
    for (const p of rows) {
      const meters = groundMeters(latitude, longitude, p.latitude, p.longitude);
      if (meters < bestMeters) [best, bestMeters] = [p, meters]; // strict, so the earliest added wins a tie
    }
    return best ? [{ place: best._id, name: best.name, latitude: best.latitude, longitude: best.longitude }] : [];
  }

  async _search({ text }: { text: string }) {
    const q = text.trim().toLowerCase();
    // ponytail: scans every place per keystroke (~10k, a few ms); a text index if the map grows much larger.
    const rows = await this.places.find({}).toArray();
    return rows
      .filter((p) => p.kind !== "TRANSIT" && p.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.kind === "ENTRANCE") - Number(a.kind === "ENTRANCE") || byName(a.name, b.name))
      .slice(0, SEARCH_LIMIT)
      .map(({ _id, name, kind, floor, latitude, longitude }) => ({ place: _id, name, kind, floor, latitude: latitude ?? 0, longitude: longitude ?? 0 }));
  }

  async _closest({ source, text, accessibleOnly, indoorsPreferred, hour }: { source: string; text: string; accessibleOnly: boolean; indoorsPreferred: boolean; hour: number }) {
    const places = new Map((await this.places.find({}).toArray()).map((p) => [p._id, p]));
    if (!places.has(source)) return [];
    const q = text.trim().toLowerCase();
    const matches = (id: string) => {
      const p = places.get(id)!;
      return id !== source && p.kind !== "TRANSIT" && p.name.toLowerCase().includes(q);
    };
    const links = (await this.links.find({}).toArray()).sort((a, b) => a.order - b.order);
    let found = 0;
    // Settled order is cheapest first, so the search can stop at the fifth match.
    const { dist, settled } = cheapest(links, source, accessibleOnly, indoorsPreferred, hour, (id) => matches(id) && ++found >= CLOSEST);
    return settled
      .filter(matches)
      .slice(0, CLOSEST)
      .map((id) => ({ place: id, name: places.get(id)!.name, floor: places.get(id)!.floor, cost: dist.get(id)! }));
  }

  async _link({ link }: { link: string }) {
    const l = await this.links.findOne({ _id: link });
    return l ? [await describe(this.places, l)] : [];
  }

  async _blocked(_input: Record<string, never>) {
    const rows = (await this.links.find({ blocked: true }).toArray()).sort((a, b) => a.order - b.order);
    return Promise.all(rows.map(async (l) => ({ link: l._id, ...(await describe(this.places, l)) })));
  }

  async _sameService({ link }: { link: string }) {
    const existing = await this.links.findOne({ _id: link });
    if (!existing?.service) return [];
    const rows = await this.links.find({ service: existing.service }).toArray();
    return rows
      .filter((l) => l._id !== link)
      .sort((a, b) => a.order - b.order)
      .map((l) => ({ other: l._id }));
  }

  async _route({
    source,
    destination,
    accessibleOnly,
    indoorsPreferred,
    hour,
  }: {
    source: string;
    destination: string;
    accessibleOnly: boolean;
    indoorsPreferred: boolean;
    hour: number;
  }) {
    const places = new Map((await this.places.find({}).toArray()).map((p) => [p._id, p]));
    if (!places.has(source) || !places.has(destination) || source === destination) return [];
    const links = (await this.links.find({}).toArray()).sort((a, b) => a.order - b.order);

    const { came } = cheapest(links, source, accessibleOnly, indoorsPreferred, hour, (place) => place === destination);
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
      kind: place.kind,
      floor: place.floor,
      distance: link.distance ?? 1,
      latitude: place.latitude ?? 0,
      longitude: place.longitude ?? 0,
    }));
  }
}
