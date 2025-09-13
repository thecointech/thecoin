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

  protected async loadDb(): Promise<PouchDB.Database<ConfigShape>> {

    log.info(`Initializing in-memory config database`);
    if (globalThis.__temp_config) {
      return globalThis.__temp_config;
    }
    globalThis.__temp_config = new PouchDB<ConfigShape>("in-memory", { adapter: 'memory' });
    // Disable closing in development
    globalThis.__temp_config['close'] = () => Promise.resolve();
    await this.initMockDb();
    return globalThis.__temp_config;
  }

  private async initMockDb(): Promise<void> {
    // Seed DB in development with default config
    const cfg = getSeedConfig();
    await this.set(cfg)
  }
}
