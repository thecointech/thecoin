import type { StoredData } from '../src/state/types';
import { StateDatabase as SrcStateDatabase } from '../src/state';
import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory';

// Note: multiple imports of this are not an issue
PouchDB.plugin(memory);

declare global {
  var __temp_state: PouchDB.Database<StoredData>;
}

export class StateDatabase extends SrcStateDatabase {
  protected override async loadDb(): Promise<PouchDB.Database<StoredData>> {
    globalThis.__temp_state ??= new PouchDB<StoredData>("in-memory", { adapter: 'memory' })
    // Disable closing in development
    globalThis.__temp_state['close'] = () => Promise.resolve();
    return Promise.resolve(globalThis.__temp_state);
  }
}
