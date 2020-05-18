import PouchDB from 'pouchdb';
import upsert from 'pouchdb-upsert';

PouchDB.plugin(upsert);

const STORAGE_PATH = process.env.COIN_ADMINDB_PATH;

export function BaseStore<T>(name: string) {
  return class BaseStore {
    protected static db: PouchDB.Database<T>;
    private static counter: number = 0;

    static initialize(options?: PouchDB.Configuration.DatabaseConfiguration) {
      if (BaseStore.db == null) {
        const mergeopts = {
          revs_limit: 1,
          prefix: STORAGE_PATH,
          ...options
        };
        console.log(`Initializing DB at: ${mergeopts.prefix ?? 'localStorage'}`);

        BaseStore.db = new PouchDB(name, mergeopts);
      }
      BaseStore.counter++;
    }

    static async release() {
      BaseStore.counter = Math.max(0, BaseStore.counter - 1);
      if (0 == BaseStore.counter) {
        await BaseStore.db?.close();
        BaseStore.db = null;
      }
    }
  }
}
