import { createStep } from './steps';
import { setSchedule } from './schedule';
import { log } from '@thecointech/logging';
import { randomUUID } from 'node:crypto';
import { rootFolder } from '../paths';
import { getSecureConfigPassword } from '../secureConfig';
import { useSigner } from './signer';
import { CoinAccountDetails, ConfigDatabase } from '@thecointech/store-harvester';
import { HarvestConfig, ConfigShape, CreditDetails, HarvestStepType } from '@thecointech/store-harvester';
import { optIntoMonitoring } from './monitoring';

const db = new ConfigDatabase(rootFolder, getSecureConfigPassword);

export async function setProcessConfig(config: Partial<ConfigShape>) {
  log.info("Setting config file...");
  await db.set(config);
  log.info("Config file set");
}

export async function getProcessConfig(): Promise<ConfigShape|undefined> {
  return await db.get();
}

export async function getCoinAccountDetails(): Promise<CoinAccountDetails|null> {
  const cfg = await db.get();
  if (!cfg?.coinAccount) {
    return null;
  }
  return {
    address: cfg.coinAccount.address,
    name: cfg.coinAccount.name,
  }
}

// Lazily generate (and persist) a random installation identifier.
// Deliberately not derived from any machine-identifying information.
export async function getOrCreateInstallationId() {
  const cfg = await db.get();
  if (cfg?.installationId) {
    return cfg.installationId;
  }
  const installationId = randomUUID();
  await setProcessConfig({ installationId });
  return installationId;
}

export function isDeprecated(type: HarvestStepType): boolean {
  return type === HarvestStepType.Heartbeat;
}

export async function hydrateProcessor() {
  const config = await db.get();
  if (!config?.steps) {
    throw new Error('No config found');
  }

  const steps = Object.values(config.steps)
    .filter(step => !!step)
    .filter(step => !isDeprecated(step.type))
    .map(createStep)

  return steps;
}

export async function setCreditDetails(creditDetails: CreditDetails) {
  await db.set({creditDetails})
  log.debug(`Set credit details`)
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
    await setSchedule(config.schedule);
  }
  await setProcessConfig(config);

  // If we have a configuration with steps defined:
  // TODO: Put `optIntoMonitoring` probably here in this config (?)
  if (config.steps) {
    try {
      await useSigner(async (wallet) => {
        const installationId = await getOrCreateInstallationId();
        await optIntoMonitoring(wallet, installationId);
      });
    }
    catch (error) {
      if (error instanceof Error && error.message === "Coin account not set") {
        log.debug("No wallet configured, skipping monitoring opt-in");
      }
      else {
        throw error;
      }
    }
  }
  else {
    log.debug("No steps configured, skipping monitoring opt-in");
  }

  return true;
}
