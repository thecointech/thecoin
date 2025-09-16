import { ConfigShape } from "./types";
import { defaultDays, defaultTime } from "./types-harvest";
import type { ScrapingConfig } from "./types-scraper";

const initConfig: ConfigShape = {
  steps: [],
  schedule: {
    daysToRun: defaultDays,
    timeToRun: defaultTime,
  }
}

export const transformIn = (config: Partial<ConfigShape>, last?: ConfigShape) => {

  let scraping = getScrapingConfig(last?.scraping, config.scraping);
  const prior = last ?? initConfig;
  return {
    ...prior,
    ...config,
    // Manual overrides
    schedule: {
      ...prior.schedule,
      ...config.schedule,
    },
    scraping,
  }
};

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
