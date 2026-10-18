import { type Collection, type Db, MongoServerError } from "mongodb";

export class TripNameTaken extends Error {}
export class EmptyTripName extends Error {}
export class NoSuchTrip extends Error {}

interface TripDoc {
  _id: string;
  owner: string;
  name: string;
  source: string;
  destination: string;
  accessibleOnly: boolean;
  at: number;
}

/** Trips a person saves under their own names to start again in one step. */
export class PlanningConcept {
  private readonly trips: Collection<TripDoc>;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "Planning") {
    this.trips = database.collection(`${name.toLowerCase()}.trips`);
  }

  #ready() {
    this.indexes ??= this.trips.createIndex({ owner: 1, name: 1 }, { unique: true }).catch((error: unknown) => {
      this.indexes = undefined;
      throw error;
    });
    return this.indexes;
  }

  async save({ owner, name, source, destination, accessibleOnly }: { owner: string; name: string; source: string; destination: string; accessibleOnly: boolean }) {
    if (!name.trim()) throw new EmptyTripName("A trip needs a name.");
    await this.#ready();
    const trip = crypto.randomUUID();
    try {
      await this.trips.insertOne({ _id: trip, owner, name, source, destination, accessibleOnly, at: Date.now() });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) throw new TripNameTaken("You already have a trip with that name.");
      throw error;
    }
    return { trip };
  }

  async remove({ owner, trip }: { owner: string; trip: string }) {
    // Someone else's trip is refused exactly like a missing one, so nobody learns it exists.
    const { deletedCount } = await this.trips.deleteOne({ _id: trip, owner });
    if (!deletedCount) throw new NoSuchTrip("You have no such trip.");
    return {};
  }

  async _trips({ owner }: { owner: string }) {
    const rows = await this.trips.find({ owner }).sort({ at: 1, _id: 1 }).toArray();
    return rows.map((t) => ({ trip: t._id, name: t.name, source: t.source, destination: t.destination, accessibleOnly: t.accessibleOnly }));
  }
}
