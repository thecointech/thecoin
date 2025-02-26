import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory'
import comdb from 'comdb';
import { defaultDays, defaultTime, HarvestConfig, Mnemonic } from '../types';
import { createStep } from './steps';
import { CreditDetails } from './types';
import { setSchedule } from './schedule';
import path from 'path';
import { log } from '@thecointech/logging';
import { dbSuffix, rootFolder } from '../paths';
import { HDNodeWallet } from 'ethers';
import { EventSection } from '@thecointech/scraper-agent';
import { getSeedConfig } from './config.seed';

PouchDB.plugin(memory)
PouchDB.plugin(comdb)

const db_path = path.join(rootFolder, `config${dbSuffix()}.db`);

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
  scraping?: {
    credit?: EventSection,
    chequing?: EventSection
  } | {
    both: EventSection
  }

} & HarvestConfig;

// We use pouchDB revisions to keep the prior state of documents
// NOTE: Not sure this works with ComDB
const ConfigKey = "config";

let __config = null as null|Promise<PouchDB.Database<ConfigShape>>;
export function getConfig(password?: string) {
  if (!__config) {
    __config = new Promise(async resolve => {
      const db = new PouchDB<ConfigShape>(db_path, {adapter: 'memory'});
      log.info(`Initializing ${process.env.NODE_ENV} config database at ${db_path}`);

      if (PERSIST_DB) {
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
      }
      resolve(db);
    })
  }
  return __config;
}

export async function getProcessConfig() {
  try {
    const db = await getConfig();
    const doc = await db.get<ConfigShape>(ConfigKey, { revs_info: true });
    return doc;
  }
  catch (err) {
    return undefined;
  }
}

export async function setProcessConfig(config: Partial<ConfigShape>) {
  log.info("Setting config file...");
  const lastCfg = await getProcessConfig();
  const db = await getConfig();
  // Scraping is a bit different, as it can be either 'credit/chequing' or 'both'
  let scraping = lastCfg?.scraping;
  if (config.scraping) {
    if ('both' in config.scraping) {
      scraping = config.scraping;
    } else {
      const original = (scraping && !('both' in scraping)) ? scraping : {};
      scraping = {
        ...original,
        ...config.scraping
      }
    }
  }

  await db.put({
    steps: config.steps ?? lastCfg?.steps ?? [],
    schedule: {
      daysToRun: config.schedule?.daysToRun ?? lastCfg?.schedule?.daysToRun ?? defaultDays,
      timeToRun: config.schedule?.timeToRun ?? lastCfg?.schedule?.timeToRun ?? defaultTime,
    },
    stateKey: config.stateKey ?? lastCfg?.stateKey,
    wallet: config.wallet ?? lastCfg?.wallet,
    creditDetails: config.creditDetails ?? lastCfg?.creditDetails,
    scraping,
    _id: ConfigKey,
    _rev: lastCfg?._rev,
  })
  // When calling this in test env it throws a (non-consequential) error
  if (PERSIST_DB) {
    await db.loadEncrypted();
  }
}

export async function setWalletMnemomic(mnemonic: Mnemonic) {
  // TODO: Generate state key from mnemomic
  await setProcessConfig({
    wallet: mnemonic,
  })
  return true;
}

export async function getWallet() {
  const cfg = await getProcessConfig();
  if (cfg?.wallet) {
    return HDNodeWallet.fromPhrase(cfg.wallet.phrase, undefined, cfg.wallet.path);
  }
  return null;
}

export async function getWalletAddress() {
  const wallet = await getWallet();
  return wallet?.address ?? null;
}

export async function hydrateProcessor() {
  const config = await getProcessConfig();
  if (!config?.steps) {
    throw new Error('No config found');
  }

  const steps = Object.values(config.steps)
    .filter(step => !!step)
    .map(createStep)

  return steps;
}

export async function setCreditDetails(creditDetails: CreditDetails) {
  await setProcessConfig({creditDetails})
  return true;
}

export async function getCreditDetails() {
  const config = await getProcessConfig();
  return config?.creditDetails;
}
export async function hasCreditDetails() {
  return !!(await getCreditDetails());
}

export async function getHarvestConfig() {
  const config = await getProcessConfig();
  return config?.steps
    ? {
        steps: config.steps,
        schedule: config.schedule,
      }
    : undefined;
}

export async function setHarvestConfig(config: HarvestConfig) {
  const existing = await getHarvestConfig();
  await setSchedule(config.schedule, existing?.schedule);
  await setProcessConfig(config)
  return true;
}
