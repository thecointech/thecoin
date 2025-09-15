import { log } from '@thecointech/logging';
import { DatabaseConfig, isPouchError } from './types';
import path from 'path';
import { withTimeout, E_TIMEOUT, type MutexInterface } from 'async-mutex';

export abstract class BaseDatabase<Shape extends {}, Stored extends {}=Shape, InShape=Shape, DbConfig extends DatabaseConfig<Shape, Stored, InShape>=DatabaseConfig<Shape, Stored, InShape>> {
  protected config: DbConfig;
  private mutex: MutexInterface;

  constructor(config: DbConfig, mutex: MutexInterface) {
    this.config = config;
    const timeout = Number(process.env.HARVESTER_DB_TIMEOUT ?? 30 * 1000);
    this.mutex = withTimeout(mutex, timeout);
  }

  get dbPath() {
    const dbname = `${this.config.dbname}${dbSuffix()}.db`
    return path.join(this.config.rootFolder, dbname);
  }

  protected abstract loadDb(): Promise<PouchDB.Database<Stored>>;

  async withDatabase<ReturnType>(
    operation: (db: PouchDB.Database<Stored>) => Promise<ReturnType>
  ): Promise<ReturnType> {
    try {
      return await this.mutex.runExclusive(async () => {
        const db = await this.loadDb();
        let opErr: unknown;
        try {
          return await operation(db);
        } catch (err) {
          opErr = err;
          throw err;
        } finally {
          try {
            await db.close();
          } catch (closeErr) {
            log.warn(closeErr, 'Error closing PouchDB instance');
            if (!opErr) throw closeErr;
          }
        }
      });
    } catch (err) {
      log.error(err, `Error in ${this.config.dbname} withDatabase`);
      if (err === E_TIMEOUT) {
        throw new Error(`Database ${this.config.dbname} ${operation.name} timed out`);
      }
      throw err;
    }
  }



  async get() {
    return this.withDatabase(async (db) => {
      const raw = await this._raw(db);
      return raw
        ? this.config.transformOut(raw)
        : undefined;
    });
  }

  async set(data: InShape): Promise<void> {
    return this.withDatabase(async (db) => {
      const last = await this._raw(db);
      const stored = this.config.transformIn(data, last);
      await db.put({
        ...stored,
        _id: this.config.key,
        _rev: last?._rev,
      });
    });
  }

  // Get without conversions
  async raw() {
    return this.withDatabase(async (db) => {
      return this._raw(db);
    });
  }

  protected async _raw(db: PouchDB.Database<Stored>) {
    try {
      return await db.get(this.config.key, { revs_info: true, latest: true });
    } catch (err) {
      if (isPouchError(err) && err.status === 404) {
        return undefined;
      }
      log.error(err, "Error getting process config");
      throw err;
    }
  }
}


export function dbSuffix() {
  // We may run production builds in development mode, and
  // in these cases we don't want use the actual production DB
  if (process.env.NODE_ENV === 'development') {
    return '.dev';
  }
  else if (process.env.CONFIG_NAME === 'prodtest') {
    return '.test';
  }
  return ''
}
