import PouchDB from 'pouchdb';
import { DatabaseConfig } from './types';
import { BaseDatabase } from './base';

export class BasicDatabase<Shape extends {}, Stored extends {}=Shape> extends BaseDatabase<Shape, Stored> {

  constructor(config: DatabaseConfig<Shape, Stored>) {
    super(config);
  }

  // private getDbPath(): string {
  //   const suffix = this.getDbSuffix();
  //   return path.join(this.config.rootFolder, `harvester${suffix}.db`);
  // }

  // private getDbSuffix(): string {
  //   return '';
  // }

  protected async loadDb(options?: { adapter: string }) {
    const db_path = this.dbPath;
    return new PouchDB<Stored>(db_path, options);
  }

  // async withDatabase<T>(
  //   operation: (db: PouchDB.Database<StoredData>) => Promise<T>
  // ): Promise<T> {
  //   const db = this.loadDb();
  //   try {
  //     return await operation(db);
  //   } finally {
  //     await db.close();
  //   }
  // }

  // private async get(): Promise<StoredData | undefined> {
  //   return this.withDatabase(async (db) => {
  //     try {
  //       return await db.get(this.StateKey, { revs_info: true, latest: true });
  //     } catch (err) {
  //       return undefined;
  //     }
  //   });
  // }

  // async set(data: HarvestData): Promise<void> {
  //   return this.withDatabase(async (db) => {
  //     const lastState = await this.get();
  //     await db.put({
  //       _id: this.StateKey,
  //       _rev: lastState?._rev,
  //       ...toDb(data),
  //     });
  //   });
  // }
}
