import { EventSection } from "@thecointech/scraper-agent";
import { getProcessConfig, setProcessConfig } from "./config";
import { ActionType, BankType } from "./scraper";


export async function setEvents(type: BankType, events: EventSection) {
  await setProcessConfig({
    scraping: {
      [type]: events
    }
  })
}

export async function getEvents(type: ActionType) {

  const config = await getProcessConfig();
  if (!config?.scraping)  {
    throw new Error(`No base node found for ${type}`);
  }
  const scrapingSource = type == 'visaBalance' ? 'credit' : 'chequing';
  const baseNode = ('both' in config.scraping)
    ? config.scraping.both
    : config.scraping[scrapingSource];

  if (!baseNode) {
    throw new Error(`No base node found for ${type}`);
  }
  return baseNode;
}