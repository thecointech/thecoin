import type { BankEvents, BankIdent, BankType } from "@thecointech/store-harvester";
import type { RendererBankType } from "@/Agent/state/types";
import type { ProcessAccount } from "@thecointech/scraper-agent/types";
import { getProcessConfig, setProcessConfig } from "./config";

export async function setEvents(type: BankType, config: BankEvents) {
  await setProcessConfig({
    // Note: merging is handled at the DB level
    scraping: {
      [type]: config
    }
  })
}

export async function getScrapingConfig() {
  const config = await getProcessConfig();
  return config?.scraping;
}

export async function getBankConfig(type: RendererBankType): Promise<BankEvents | undefined> {
  const config = await getProcessConfig();
  if (!config?.scraping) return undefined;
  return ('both' in config.scraping)
    ? config.scraping.both
    : config.scraping[type];
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
