// types for comdb

/// <reference types="pouchdb-core" />

declare module 'comdb';

declare namespace PouchDB {
  interface Database<Content extends {} = {}> {

    setPassword: (password: string) => Promise;

    loadEncrypted(): Promise;
    loadDecrypted(): Promise;

    // The on-disk encrypted database
    _encrypted?: PouchDB.Database<Content>;
  }
}

declare module 'comdb' {
  const plugin: PouchDB.Plugin;
  export = plugin;
}
