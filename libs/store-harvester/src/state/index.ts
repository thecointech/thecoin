import { BasicDatabase } from "../store/basic";
import { StoredData } from "./transform";
import { HarvestData } from "./types.harvest";
import { fromDb, toDb } from "./transform";
import { Mutex } from "@thecointech/async";
export { toDb, fromDb } from './transform';

export class StateDatabase extends BasicDatabase<HarvestData, StoredData> {
  static mutex = new Mutex();
  constructor(rootFolder: string) {
    super({
      rootFolder,
      key: "state",
      dbname: 'harvester',
      transformIn: toDb,
      transformOut: fromDb,
    }, StateDatabase.mutex);
  }

  // Get all versions of the state.
  // Note, this will return the state in reverse chronological order
  async getAll() {
    return this.withDatabase(async (db) => {
      const latest = await this._raw(db);
      if (!latest) {
        return [];
      }
      const raw = await Promise.all(
        latest._revs_info?.map(r => db.get("state", { rev: r.rev })) ?? []
      );
      return raw.map(fromDb);
    });
  }
}
