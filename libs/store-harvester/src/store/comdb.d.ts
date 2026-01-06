// types for comdb

/// <reference types="pouchdb-core" />

declare module 'comdb';

declare namespace PouchDB {
  interface Database<Content extends {} = {}> {

    setPassword: (password: string) => Promise;

    loadEncrypted(): Promise;
    loadDecrypted(): Promise;

    /** @internal The on-disk encrypted database handle; cleared on db.close */
    _encrypted?: PouchDB.Database<Content>;
  }
}

declare module 'comdb' {
  const plugin: PouchDB.Plugin;
  export = plugin;
}
