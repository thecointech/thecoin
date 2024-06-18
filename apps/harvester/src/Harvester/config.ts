import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory'
import comdb from 'comdb';
import { defaultDays, defaultTime, HarvestConfig, Mnemonic } from '../types';
import { createStep } from './steps';
import { CreditDetails } from './types';
import { setSchedule } from './schedule';
import path from 'path';
import { log } from '@thecointech/logging';
import { ActionTypes, AnyEvent } from '../scraper/types';
import { dbSuffix, rootFolder } from '../paths';
import { HDNodeWallet } from 'ethers';

PouchDB.plugin(memory)
PouchDB.plugin(comdb)

const db_path = path.join(rootFolder, `config${dbSuffix()}.db`);

export type ConfigShape = {
  // Store the account Mnemomic
  wallet?: Mnemonic,
  // Store a constant key for the account state DB
  // This key should be derived from wallet mnemonic
  stateKey?: string,

  creditDetails?: CreditDetails,

  scraping?: {
    [key in ActionTypes]?: AnyEvent[];
  },

} & HarvestConfig;

// We use pouchDB revisions to keep the prior state of documents
// NOTE: Not sure this works with ComDB
const ConfigKey = "config";

let __config = null as unknown as PouchDB.Database<ConfigShape>;
export async function getConfig(password?: string) {
  if (!__config) {
    __config = new PouchDB<ConfigShape>(db_path, {adapter: 'memory'});
    log.info(`Initializing ${process.env.NODE_ENV} config database at ${db_path}`);
    if (process.env.NODE_ENV !== "development") {
      log.info(`Encrypting config DB`);
      // initialize the config db
      // Yes, this is a hard-coded password.
      // Will fix ASAP with dynamically
      // generated code (Apr 04 2023)
      await __config.setPassword(password ?? "hF,835-/=Pw\\nr6r");
      await __config.loadEncrypted();
    }
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
  await db.put({
    steps: config.steps ?? lastCfg?.steps ?? [],
    schedule: {
      daysToRun: config.schedule?.daysToRun ?? lastCfg?.schedule?.daysToRun ?? defaultDays,
      timeToRun: config.schedule?.timeToRun ?? lastCfg?.schedule?.timeToRun ?? defaultTime,
    },
    stateKey: config.stateKey ?? lastCfg?.stateKey,
    wallet: config.wallet ?? lastCfg?.wallet,
    creditDetails: config.creditDetails ?? lastCfg?.creditDetails,
    scraping: {
      ...lastCfg?.scraping,
      ...config.scraping,
    },
    _id: ConfigKey,
    _rev: lastCfg?._rev,
  })
  await db.loadDecrypted();
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

export async function setEvents(type: ActionTypes, events: AnyEvent[]) {
  await setProcessConfig({
    scraping: {
      [type]: events
    }
  })
}

export async function getEvents(type: ActionTypes) {
  const config = await getProcessConfig();
  return config?.scraping?.[type];
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
