
// export * from './base'
export * from './config'
import { StoragePath, BaseStore as _BaseStore } from './base';
import { ConfigStore as _ConfigStore } from './config';
import { mkdir } from 'fs';

export function BaseStore<T extends Object>(name: string) {
  // In linux, the store will throw an exception if the base folder doesn't exist
  ensurePath();
  return _BaseStore<T>(name);
}

export class ConfigStore extends _ConfigStore {
  static initialize(options?: PouchDB.Configuration.DatabaseConfiguration): void {
    ensurePath();
    super.initialize(options);
  }
}

function ensurePath() {
  const createAt = StoragePath();
  if (createAt) {
    mkdir(createAt, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}