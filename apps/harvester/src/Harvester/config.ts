import { PayVisa } from './PayVisa';
import { RoundUp } from './RoundUp';
import { TransferEverything } from './TransferEverything';
import { TransferLimit } from './TransferLimit';
import { TransferVisaOwing } from './TransferVisaOwing';
import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory'
import comdb from 'comdb';
import { Wallet } from '@ethersproject/wallet';
import { Mnemonic } from '@ethersproject/hdnode';
import { defaultDays, HarvestConfig } from '../types';

PouchDB.plugin(memory)
PouchDB.plugin(comdb)

export type ConfigShape = {
  // Store the account Mnemomic
  wallet?: Mnemonic,
  // Store a constant key for the account state DB
  // This key should be derived from wallet mnemonic
  stateKey?: string,
} & HarvestConfig;

// We use pouchDB revisions to keep the prior state of documents
// NOTE: Not sure this works with ComDB
const ConfigKey = "config";

let _config = null as unknown as PouchDB.Database<ConfigShape>;
export async function initialize(password?: string) {
  _config = new PouchDB<ConfigShape>('config', {adapter: 'memory'});
  if (password) {
    await _config.setPassword("password");
    await _config.loadEncrypted();
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
  const lastCfg = await getProcessConfig();
  const r = await _config.put({
    steps: config.steps ?? lastCfg?.steps ?? [],
    daysToRun: config.daysToRun ?? lastCfg?.daysToRun ?? defaultDays,
    stateKey: config.stateKey ?? lastCfg?.stateKey,
    wallet: config.wallet ?? lastCfg?.wallet,
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

export async function getWalletAddress() {
  const cfg = await getProcessConfig();
  if (cfg?.wallet) {
    const wallet = Wallet.fromMnemonic(cfg.wallet.phrase, cfg.wallet.path);
    return wallet.address;
  }
  return null;
}

export async function hydrateProcessor() {
  const config = await getProcessConfig();
  if (!config?.steps) {
    throw new Error('No config found');
  }

  return config.steps.map(stage => {
    switch (stage?.name) {
      case 'roundUp': return new RoundUp(stage.args);
      case 'transferEverything': return new TransferEverything();
      case 'transferLimit': return new TransferLimit(stage.args);
      case 'transferVisaOwing': return new TransferVisaOwing();
      case 'payVisa': return new PayVisa(stage.args);
      case null: return null;
      default: throw new Error(`Unknown processing stage: ${stage!.name}`);
    }
  })
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
  await setProcessConfig(config)
  return true;
}
