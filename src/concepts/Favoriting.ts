import { type Collection, type Db, MongoServerError } from "mongodb";

export class AlreadyFavorite extends Error {}
export class NotFavorite extends Error {}

interface FavoriteDoc {
  _id: string;
  user: string;
  item: string;
  at: number;
}

/** Each person's short list of items they come back to. */
export class FavoritingConcept {
  private readonly favorites: Collection<FavoriteDoc>;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "Favoriting") {
    this.favorites = database.collection(`${name.toLowerCase()}.favorites`);
  }

  // The unique index is what stops a double favorite, even when two requests race.
  #ready() {
    this.indexes ??= this.favorites.createIndex({ user: 1, item: 1 }, { unique: true }).catch((error: unknown) => {
      this.indexes = undefined;
      throw error;
    });
    return this.indexes;
  }

  async favorite({ user, item }: { user: string; item: string }) {
    await this.#ready();
    try {
      await this.favorites.insertOne({ _id: crypto.randomUUID(), user, item, at: Date.now() });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) throw new AlreadyFavorite("That is already a favorite.");
      throw error;
    }
    return {};
  }

  async unfavorite({ user, item }: { user: string; item: string }) {
    const { deletedCount } = await this.favorites.deleteOne({ user, item });
    if (!deletedCount) throw new NotFavorite("That is not a favorite.");
    return {};
  }

  async _favorites({ user }: { user: string }) {
    const rows = await this.favorites.find({ user }).sort({ at: -1 }).toArray();
    return rows.map((f) => ({ item: f.item }));
  }
}
