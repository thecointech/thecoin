import { StoredData } from '../src';
import { StateDatabase as SrcStateDatabase } from '../src/state';
import PouchDB from 'pouchdb';

declare global {
  var __temp_state: PouchDB.Database<StoredData>;
}

export class StateDatabase extends SrcStateDatabase {
  loadDb(): Promise<PouchDB.Database<StoredData>> {
    globalThis.__temp_state ??= new PouchDB<StoredData>("in-memory", { adapter: 'memory' })
    // Disable closing in development
    globalThis.__temp_state['close'] = () => Promise.resolve();
    return Promise.resolve(globalThis.__temp_state);
  }
}
