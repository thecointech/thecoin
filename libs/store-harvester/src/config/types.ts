import type { HarvestConfig } from "./types-harvest";
import type { ScrapingConfig } from "./types-scraper";
export * from "./types-harvest";
export * from "./types-scraper";
export * from "./types-steps";

export type ConfigShape = {
  // Store the account Mnemomic
  wallet?: Mnemonic,
  // Store a constant key for the account state DB
  // This key should be derived from wallet mnemonic
  stateKey?: string,

  // The payment details for the users visa card
  creditDetails?: CreditDetails,

  // If the user has a single bank, we can use
  // the same scraping config for both
  scraping?: ScrapingConfig,

  alwaysRunScraperVisible?: boolean,
  alwaysRunScraperLogging?: boolean,

} & HarvestConfig;

export interface Mnemonic {
  readonly phrase: string;
  readonly path: string;
  readonly locale: string;
};

export type CreditDetails = {
  payee: string,
  accountNumber: string,
}
