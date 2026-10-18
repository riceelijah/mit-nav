import type { Collection, Db } from "mongodb";

interface PreferenceDoc {
  _id: string; // the user
  stepFree: boolean;
  useLocation: boolean;
}

/** How each person likes the app to behave, on every visit and device. */
export class PreferringConcept {
  private readonly preferences: Collection<PreferenceDoc>;

  constructor(database: Db, name = "Preferring") {
    this.preferences = database.collection(`${name.toLowerCase()}.preferences`);
  }

  async set({ user, stepFree, useLocation }: { user: string; stepFree: boolean; useLocation: boolean }) {
    await this.preferences.updateOne({ _id: user }, { $set: { stepFree, useLocation } }, { upsert: true });
    return {};
  }

  async _preferences({ user }: { user: string }) {
    const found = await this.preferences.findOne({ _id: user });
    return { stepFree: found?.stepFree ?? false, useLocation: found?.useLocation ?? false };
  }
}
