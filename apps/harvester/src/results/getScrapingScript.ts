import { BankEvents, ScrapingConfig } from "@thecointech/store-harvester";

export function getScrapingScript(config: any): ScrapingConfig {
  const scrapingImport = config?.scraping;
  if (!scrapingImport) {
    throw new Error('Invalid config: missing config');
  }
  let r: ScrapingConfig;

  if ('both' in scrapingImport) {
    r = {
      both: verifyBankEvents(scrapingImport['both'], 'both')
    };
  }
  else if ('credit' in scrapingImport && 'chequing' in scrapingImport) {
    r = {
      credit: verifyBankEvents(scrapingImport['credit'], 'credit'),
      chequing: verifyBankEvents(scrapingImport['chequing'], 'chequing')
    };
  }
  else {
    throw new Error('Invalid config: missing both or credit and chequing');
  }
  return r;
}

const verifyBankEvents = (source: any, key: string) : BankEvents => {
  if (!source || typeof source !== "object") {
    throw new Error(`Invalid script format: ${key} is missing events`);
  }
  if (!(
    source.hasOwnProperty('name') &&
    source.hasOwnProperty('url') &&
    source.hasOwnProperty('events') &&
    source.hasOwnProperty('username') &&
    source.hasOwnProperty('password') &&
    source.hasOwnProperty('accounts')
  )) {
    throw new Error(`Invalid script format: ${key} is missing events`);
  }
  return {
    events: source.events,
    accounts: source.accounts,
    name: source.name,
    url: source.url,
    username: source.username,
    password: source.password,
  }
}
