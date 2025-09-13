import PouchDB from 'pouchdb';
import { DatabaseConfig } from './types';
import { BaseDatabase } from './base';
import type { Mutex } from '@thecointech/async';

export class BasicDatabase<Shape extends {}, Stored extends {}=Shape> extends BaseDatabase<Shape, Stored> {

  constructor(config: DatabaseConfig<Shape, Stored>, mutex: Mutex) {
    super(config, mutex);
  }

  protected async loadDb(options?: { adapter: string }) {
    const db_path = this.dbPath;
    return new PouchDB<Stored>(db_path, options);
  }
}
