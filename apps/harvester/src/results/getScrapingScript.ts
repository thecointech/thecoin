import { BankTypes, ScrapingConfig } from "@thecointech/store-harvester";

export function getScrapingScript(config: any) {
  const scraping: ScrapingConfig = config?.scraping;
  if (!scraping) {
    throw new Error('Invalid config: missing config');
  }
  let foundSomething = false;
  for (const key in scraping) {
    if (!BankTypes.hasOwnProperty(key)) {
      throw new Error(`Invalid script format: ${key} is not recognized`);
    }
    foundSomething = true;
  }
  if (!foundSomething) {
    throw new Error('Invalid script: missing any valid banktype');
  }
  return scraping;
}
