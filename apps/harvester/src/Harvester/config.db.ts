import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory'
import comdb from 'comdb';
import { HarvestConfig, Mnemonic } from '../types';
import { CreditDetails } from './types';
import path from 'path';
import { log } from '@thecointech/logging';
import { dbSuffix, rootFolder } from '../paths';
import { getSeedConfig } from './config.seed';
import { ScrapingConfig } from './scraper';

PouchDB.plugin(memory)
PouchDB.plugin(comdb)

// Dev loads fresh every time, devlive should... reset on devlive run?
const PERSIST_DB = process.env.CONFIG_NAME !== "development"

export type ConfigShape = {
  // Store the account Mnemomic
  wallet?: Mnemonic,
  // Store a constant key for the account state DB
  // This key should be derived from wallet mnemonic
  stateKey?: string,

  // The payment details for the users visa card
  creditDetails?: CreditDetails,

  // If the user has a single bank, we can use
  // the same scraping config for both
  scraping?: ScrapingConfig,

  // Lingering (systemd user background)
  isLingeringEnabled?: boolean;

} & HarvestConfig;

// We use pouchDB revisions to keep the prior state of documents
// NOTE: Not sure this works with ComDB
export const ConfigKey = "config";

let __config = null as null|Promise<PouchDB.Database<ConfigShape>>;
export function getConfig(password?: string, persist = PERSIST_DB, db_name?: string) {
  if (!__config) {
    __config = new Promise(async resolve => {

      const db_path = getDbPath(db_name);
      log.info(`Initializing ${process.env.NODE_ENV} config database at ${db_path}`);
      const db = new PouchDB<ConfigShape>(db_path, {adapter: 'memory'});

      if (persist) {
        log.info(`Encrypting config DB`);
        // initialize the config db
        // Yes, this is a hard-coded password.
        // Will fix ASAP with dynamically
        // generated code (Apr 04 2023)
        await db.setPassword(password ?? "hF,835-/=Pw\\nr6r");
        await db.loadEncrypted();
      }
      else {
        // Seed DB in development
        await db.put({
          _id: ConfigKey,
          ...getSeedConfig()
        })
        // mock the function to propagate changes to the encrypted DB
        db.loadDecrypted = () => Promise.resolve();
      }
      resolve(db);
    })
  }
  return __config;
}

export function getDbPath(db_name?: string) {
  return path.join(rootFolder, db_name ?? `config${dbSuffix()}.db`);
}
