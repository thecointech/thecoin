/// <reference path="./comdb.d.ts" />
import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory';
import comdb from 'comdb';
import { log } from '@thecointech/logging';
import { BaseDatabase } from './base';
import { DatabaseConfig } from './types';

PouchDB.plugin(memory);
PouchDB.plugin(comdb);

interface EncryptedConfig<Shape extends {}, Stored extends {}=Shape, InShape=Shape> extends DatabaseConfig<Shape, Stored, InShape> {
  password: string;
}

export class EncryptedDatabase<Shape extends {}, Stored extends {}=Shape, InShape=Shape> extends BaseDatabase<Shape, Stored, InShape, EncryptedConfig<Shape, Stored, InShape>> {

  constructor(config: EncryptedConfig<Shape, Stored, InShape>) {
    super(config);
  }

  // private getDbPath(db_name?: string): string {
  //   const suffix = this.getDbSuffix();
  //   return path.join(this.config.rootFolder, db_name ?? `config${suffix}.db`);
  // }


  protected async loadDb(): Promise<PouchDB.Database<Stored>> {
    try {
      const db = new PouchDB<Stored>(this.dbPath, { adapter: 'memory' });
      await this.initEncryptedDb(db, this.config.password);
      return db;
    } catch (err) {
      const isLockError = err instanceof Error &&
        (err.message.includes('LOCK') || err.message.includes('Resource temporarily unavailable'));

      if (isLockError) {
        const errorMessage = `Database is locked by another instance of the harvester application. ` +
          `Please close any other running instances and try again. ` +
          `Database path: ${this.dbPath}`;

        log.fatal({
          error: err,
          dbPath: this.dbPath,
          suggestion: "Close other harvester instances"
        }, errorMessage);

        const userError = new Error(errorMessage);
        userError.name = 'DatabaseLockError';
        throw userError;
      }

      log.fatal(err, "Couldn't load config DB");
      throw err;
    }
  }

  private async initEncryptedDb(db: PouchDB.Database<Stored>, password?: string): Promise<void> {
    await db.setPassword(password ?? "hF,835-/=Pw\\nr6r");
    await db.loadEncrypted();
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

      await db.loadDecrypted();
    });
  }
}
