import PouchDB from 'pouchdb';
import upsert from 'pouchdb-upsert';
import { log } from '@thecointech/logging';

PouchDB.plugin(upsert);

export const StoragePath = () => process.env.STORAGE_PATH;

// Duplicated out of PouchDB-upsert to keep types happy upstream
type UpsertResponse = {
  id: PouchDB.Core.DocumentId;
  rev: PouchDB.Core.RevisionId;
  updated: boolean;
}

export function BaseStore<T extends Object>(name: string) {

  type UpsertFn = (val: Partial<T>) => false | T;

  return class BaseStore {
    static db: PouchDB.Database<T>;
    static counter: number = 0;

    static merge(key: string, value: T) {
      return BaseStore.upsert(key, (doc) => ({
        ...doc,
        ...value
      }));
    }

    static upsert(key: string, upsertfn: UpsertFn): Promise<UpsertResponse> {
      return this.db.upsert<T>(key, upsertfn);
    }

    static initialize(options?: PouchDB.Configuration.DatabaseConfiguration) {
      if (BaseStore.db == null) {
        const mergeopts = {
          revs_limit: 1,
          prefix: StoragePath(),
          ...options
        };
        log.trace(`Initialized DB ${name} at: ${mergeopts.prefix ?? 'localStorage'}`);
        BaseStore.db = new PouchDB<T>(name, mergeopts);
      }
      BaseStore.counter++;
    }

    static async release() {
      BaseStore.counter = Math.max(0, BaseStore.counter - 1);
      if (0 == BaseStore.counter) {
        await BaseStore.db?.close();
        BaseStore.db = null as any;
      }
    }
  }
}
