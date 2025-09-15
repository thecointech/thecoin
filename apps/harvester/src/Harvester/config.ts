import { createStep } from './steps';
import { setSchedule } from './schedule';
import { log } from '@thecointech/logging';
import { HDNodeWallet } from 'ethers';
import { getProvider } from '@thecointech/ethers-provider';
import { rootFolder } from '../paths';
import { ConfigDatabase } from '@thecointech/store-harvester';
import type { HarvestConfig, Mnemonic, ConfigShape, CreditDetails } from '@thecointech/store-harvester';


const db = new ConfigDatabase(rootFolder);

export async function setProcessConfig(config: Partial<ConfigShape>) {
  log.info("Setting config file...");
  await db.set(config);
}

export async function getProcessConfig(): Promise<ConfigShape|undefined> {
  return await db.get();
}

export async function setWalletMnemomic(mnemonic: Mnemonic) {
  await db.set({
    wallet: mnemonic,
  })
  return true;
}

export async function getWallet() {
  const cfg = await db.get();
  if (cfg?.wallet) {
    const wallet = HDNodeWallet.fromPhrase(cfg.wallet.phrase, undefined, cfg.wallet.path);
    return wallet.connect(await getProvider());
  }
  return null;
}

export async function getWalletAddress() {
  const wallet = await getWallet();
  return wallet?.address ?? null;
}

export async function hydrateProcessor() {
  const config = await db.get();
  if (!config?.steps) {
    throw new Error('No config found');
  }

  const steps = Object.values(config.steps)
    .filter(step => !!step)
    .map(createStep)

  return steps;
}

export async function setCreditDetails(creditDetails: CreditDetails) {
  await db.set({creditDetails})
  return true;
}

export async function getCreditDetails() {
  const config = await db.get();
  return config?.creditDetails;
}
export async function hasCreditDetails() {
  return !!(await getCreditDetails());
}

export async function getHarvestConfig() {
  const config = await db.get();
  return config?.steps
    ? {
        steps: config.steps,
        schedule: config.schedule,
      }
    : undefined;
}

export async function setHarvestConfig(config: Partial<HarvestConfig>) {
  if (config.schedule) {
    const existing = await getHarvestConfig();
    await setSchedule(config.schedule, existing?.schedule);
  }
  await setProcessConfig(config)
  return true;
}
