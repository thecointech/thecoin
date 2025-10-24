import { BankEvents, BankIdent } from "@thecointech/store-harvester";
import { getProcessConfig, setProcessConfig } from "./config";
import { ActionType, BankType } from "./scraper";
import { ProcessAccount } from "@thecointech/scraper-agent/types";

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

export type BankConnectDetails = BankIdent & { accounts: ProcessAccount[] };
export type BankConnectMap = Partial<Record<BankType, BankConnectDetails>>;

export async function getBankConnectDetails(): Promise<BankConnectMap|undefined> {
  const config = await getProcessConfig();
  if (config?.scraping) {
    // Handle both single bank (both) and separate banks (credit/chequing)
    return Object.entries(config.scraping).reduce((acc, [key, value]) => {
      acc[key as BankType] = {
        name: value.name,
        url: value.url,
        accounts: value.accounts
      };
      return acc;
    }, {} as BankConnectMap);
  }
  return undefined;
}
