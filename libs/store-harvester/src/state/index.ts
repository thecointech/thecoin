import { BasicDatabase } from "../store/basic";
import { StoredData } from "./transform";
import { HarvestData } from "./types.harvest";
import { fromDb, toDb } from "./transform";
export { toDb, fromDb } from './transform';

export class StateDatabase extends BasicDatabase<HarvestData, StoredData> {
  constructor(rootFolder: string) {
    super({
      rootFolder,
      key: "state",
      dbname: 'harvester',
      transformIn: toDb,
      transformOut: fromDb,
    });
  }

  // Get all versions of the state.
  // Note, this will return the state in reverse chronological order
  async getAll() {
    return this.withDatabase(async (db) => {
      const r = await db.get("state", { revs_info: true });
      const raw = await Promise.all(
        r._revs_info?.map(r => db.get("state", { rev: r.rev })) ?? []
      );
      return raw.map(fromDb);
    });
  }
}
