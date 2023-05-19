import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory'
import comdb from 'comdb';
import { Wallet } from '@ethersproject/wallet';
import { Mnemonic } from '@ethersproject/hdnode';
import { defaultDays, HarvestConfig } from '../types';
import { createStep } from './steps';
import { CreditDetails } from './types';
import { setSchedule } from './schedule/scheduler';
import path from 'path';
import electron from 'electron';
import { log } from '@thecointech/logging';

PouchDB.plugin(memory)
PouchDB.plugin(comdb)

const db_path = path.join(electron.app.getPath('userData'), 'config.db');

export type ConfigShape = {
  // Store the account Mnemomic
  wallet?: Mnemonic,
  // Store a constant key for the account state DB
  // This key should be derived from wallet mnemonic
  stateKey?: string,

  creditDetails?: CreditDetails,
} & HarvestConfig;

// We use pouchDB revisions to keep the prior state of documents
// NOTE: Not sure this works with ComDB
const ConfigKey = "config";

let _config = null as unknown as PouchDB.Database<ConfigShape>;
export async function initConfig(password?: string) {
  if (!_config) {
    _config = new PouchDB<ConfigShape>(db_path, {adapter: 'memory'});
    log.info(`Initializing ${process.env.NODE_ENV} config database at ${db_path}`);
    if (process.env.NODE_ENV !== "development") {
      log.info(`Encrypting config DB`);
      // initialize the config db
      // Yes, this is a hard-coded password.
      // Will fix ASAP with dynamically
      // generated code (Apr 04 2023)
      await _config.setPassword(password ?? "hF,835-/=Pw\\nr6r");
      await _config.loadEncrypted();
    }
  }
}

export async function getProcessConfig() {
  try {
    return await _config.get<ConfigShape>(ConfigKey, { revs_info: true });
  }
  catch (err) {
    return undefined;
  }
}

export async function setProcessConfig(config: Partial<ConfigShape>) {
  await initConfig();
  log.info("Setting config file...");
  const lastCfg = await getProcessConfig();
  await _config.put({
    steps: config.steps ?? lastCfg?.steps ?? [],
    daysToRun: config.daysToRun ?? lastCfg?.daysToRun ?? defaultDays,
    stateKey: config.stateKey ?? lastCfg?.stateKey,
    wallet: config.wallet ?? lastCfg?.wallet,
    creditDetails: config.creditDetails ?? lastCfg?.creditDetails,
    _id: ConfigKey,
    _rev: lastCfg?._rev,
  })
  await _config.loadDecrypted();
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
    return Wallet.fromMnemonic(cfg.wallet.phrase, cfg.wallet.path);
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

  return Object.values(config.steps)
    .filter(step => !!step)
    .map(createStep)
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
        steps: config?.steps,
        daysToRun: config?.daysToRun,
      }
    : undefined;
}

export async function setHarvestConfig(config: HarvestConfig) {
  const existing = await getHarvestConfig();
  await setSchedule(config.daysToRun, existing?.daysToRun);
  await setProcessConfig(config)
  return true;
}
