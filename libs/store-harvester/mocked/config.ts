import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory';
import { log } from '@thecointech/logging';
import { ConfigShape } from '../src/config/types';
import { getSeedConfig } from './config.seed';
import { BaseDatabase } from '../src/store/base';
import type { ConfigDatabase as SrcConfigDatabase } from '../src/config';
import { transformIn } from '../src/config/transform';
import { Mutex } from '@thecointech/async';

PouchDB.plugin(memory);

export const ConfigKey = "config";

// We can extend ConfigDatabase directly, as that results in
// inject comdb, which throws errors as it is not initialized appropriately
export class ConfigDatabase extends BaseDatabase<ConfigShape> implements Omit<SrcConfigDatabase, "initEncryptedDb"> {

  static mutex = new Mutex();
  constructor() {
    super({
      rootFolder: "in-memory",
      dbname: "config",
      key: ConfigKey,
      transformIn,
      transformOut: (data) => data,
    }, ConfigDatabase.mutex);
  }

  protected override async loadDb(): Promise<PouchDB.Database<ConfigShape>> {

    if (globalThis.__temp_config) {
      return globalThis.__temp_config;
    }
    log.info(`Initializing in-memory config database`);
    globalThis.__temp_config = new PouchDB<ConfigShape>("in-memory", { adapter: 'memory' });
    // Disable closing in development
    globalThis.__temp_config['close'] = () => Promise.resolve();
    await this.initMockDb(globalThis.__temp_config);
    return globalThis.__temp_config;
  }

  private async initMockDb(db: PouchDB.Database<ConfigShape>): Promise<void> {
    // Seed DB in development with default config
    // Do not use the 'set' method, as the mutex
    // is currently held by whatever called this
    // const cfg = getSeedConfig();
    // const stored = this.config.transformIn(cfg);
    // await db.put({
    //   ...stored,
    //   _id: this.config.key,
    // });
  }
}
