import type { Collection, Db } from "mongodb";

export class InvalidDistance extends Error {}

interface EntryDoc {
  _id: string;
  traveller: string;
  source: string;
  destination: string;
  meters: number;
  order: number;
}

const RECENT = 20;

/** The trips each person finishes, and how far they have gone in total. */
export class JournalingConcept {
  private readonly entries: Collection<EntryDoc>;

  constructor(database: Db, name = "Journaling") {
    this.entries = database.collection(`${name.toLowerCase()}.entries`);
  }

  async finish({ traveller, source, destination, meters }: { traveller: string; source: string; destination: string; meters: number }) {
    if (!(meters >= 0)) throw new InvalidDistance("A trip cannot be shorter than nothing.");
    const entry = crypto.randomUUID();
    // ponytail: order by a per-traveller count; two finishes in the same instant could tie, which only reorders them.
    const order = await this.entries.countDocuments({ traveller });
    await this.entries.insertOne({ _id: entry, traveller, source, destination, meters, order });
    return { entry };
  }

  async _history({ traveller }: { traveller: string }) {
    const rows = await this.entries.find({ traveller }).sort({ order: -1 }).limit(RECENT).toArray();
    return rows.map((e) => ({ entry: e._id, source: e.source, destination: e.destination, meters: e.meters }));
  }

  async _totals({ traveller }: { traveller: string }) {
    const [sum] = await this.entries
      .aggregate<{ trips: number; meters: number }>([
        { $match: { traveller } },
        { $group: { _id: null, trips: { $sum: 1 }, meters: { $sum: "$meters" } } },
      ])
      .toArray();
    return { trips: sum?.trips ?? 0, meters: sum?.meters ?? 0 };
  }
}
