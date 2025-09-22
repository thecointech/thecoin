import { BankEvents } from "@thecointech/store-harvester";
import { getProcessConfig, setProcessConfig } from "./config";
import { ActionType, BankType } from "./scraper";


export async function setEvents(type: BankType, config: BankEvents) {
  await setProcessConfig({
    scraping: {
      [type]: config
    }
  })
}

export async function getEvents(type: ActionType) {

  const config = await getProcessConfig();
  if (!config?.scraping)  {
    throw new Error(`No scraping config found`);
  }
  const scrapingSource = type == 'visaBalance' ? 'credit' : 'chequing';
  const bankConfig = ('both' in config.scraping)
    ? config.scraping.both
    : config.scraping[scrapingSource];

  if (!bankConfig?.events) {
    throw new Error(`No events found for ${type}`);
  }
  return bankConfig.events;
}
