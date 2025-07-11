import { defaultDays, defaultTime, HarvestConfig, Mnemonic } from '../types';
import { createStep } from './steps';
import type { CreditDetails } from './types';
import { setSchedule } from './schedule';
import { log } from '@thecointech/logging';
import { HDNodeWallet } from 'ethers';
import type { ScrapingConfig } from './scraper';
import { getProvider } from '@thecointech/ethers-provider';
import { ConfigShape, ConfigKey, getConfig, isPouchError } from './config.db';

export async function getProcessConfig() {
  const db = await getConfig();
  try {
    const doc = await db.get(ConfigKey, { revs_info: true, latest: true });
    return doc;
  }
  catch (err) {
    if (isPouchError(err)) {
      // Doc not found, this is normal on first insert
      if (err.status === 404) {
        return undefined;
      }
    }
    log.error(err, "Error getting process config")
    throw err;
  }
}

function cleanOriginalScraping(scraping: any) : ScrapingConfig {
  // If nothing set, nothing to return.
  if (!scraping) return {};
  // If both were set, but both aren't set here
  // we duplicate both into the components.
  // This is only used when the new config is
  // not 'both' so we know one of the components
  // will be overridden before being set
  if ('both' in scraping) return {
    credit: scraping.both,
    chequing: scraping.both
  };
  // Remove any other keys than what is expected
  // (to clean any unexpected/old configs)
  return {
    credit: scraping.credit,
    chequing: scraping.chequing
  }
}

// Scraping is a bit different, as it can be either 'credit/chequing' or 'both'
function getScrapingConfig(lastCfg?: ScrapingConfig, nextCfg?: ScrapingConfig) {
  if (!nextCfg) return lastCfg;
  if (!lastCfg) return nextCfg;

  if ('both' in nextCfg) {
    return nextCfg;
  } else {
    const original = cleanOriginalScraping(lastCfg);
    return {
      ...original,
      ...nextCfg
    }
  }
}

export async function setProcessConfig(config: Partial<ConfigShape>) {
  log.info("Setting config file...");
  const lastCfg = await getProcessConfig();
  const db = await getConfig();

  let scraping = getScrapingConfig(lastCfg?.scraping, config.scraping);

  await db.put({
    steps: config.steps ?? lastCfg?.steps ?? [],
    schedule: {
      daysToRun: config.schedule?.daysToRun ?? lastCfg?.schedule?.daysToRun ?? defaultDays,
      timeToRun: config.schedule?.timeToRun ?? lastCfg?.schedule?.timeToRun ?? defaultTime,
    },
    alwaysRunScraperVisible: config.alwaysRunScraperVisible ?? lastCfg?.alwaysRunScraperVisible,
    stateKey: config.stateKey ?? lastCfg?.stateKey,
    wallet: config.wallet ?? lastCfg?.wallet,
    creditDetails: config.creditDetails ?? lastCfg?.creditDetails,
    scraping,
    _id: ConfigKey,
    _rev: lastCfg?._rev,
  })

  // Load changes from the decrypted database into the encrypted one.
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

export async function setHarvestConfig(config: Partial<HarvestConfig>) {
  if (config.schedule) {
    const existing = await getHarvestConfig();
    await setSchedule(config.schedule, existing?.schedule);
  }
  await setProcessConfig(config)
  return true;
}
