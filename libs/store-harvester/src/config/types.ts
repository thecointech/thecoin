import type { HarvestConfig } from "./types-harvest";
import type { ScrapingConfig } from "./types-scraper";
export * from "./types-harvest";
export * from "./types-scraper";
export * from "./types-steps";

export type ConfigShape = {
  // Randomly generated identifier for this installation, used only to
  // correlate harvester-monitoring events. Generated lazily on first use;
  // survives app reinstalls but not a full OS wipe. Deliberately not
  // derived from any machine-identifying information (no PII).
  installationId?: string,

  // Store the account Mnemomic
  // wallet?: Mnemonic,
  coinAccount?: CoinAccount,
  // Store a constant key for the account state DB
  // This key should be derived from wallet mnemonic
  stateKey?: string,

  // The payment details for the users visa card
  creditDetails?: CreditDetails,

  // If the user has a single bank, we can use
  // the same scraping config for both
  scraping?: ScrapingConfig,

  // Three-way scraper window mode.  'offscreen'
  // runs a real headed browser with the window parked off-screen:
  // near-identical fingerprint to a visible run, invisible to the user.
  // Keep this string union in sync with ScraperVisibility in @thecointech/scraper.
  scraperVisibilityMode?: 'headless' | 'offscreen' | 'visible',
  alwaysRunScraperLogging?: boolean,

} & HarvestConfig;

export interface Mnemonic {
  readonly path: string;
  readonly locale: string;
};

export type CoinAccountDetails = {
  readonly address: string;
  readonly name: string;
}
export type CoinAccount = {
  mnemonic?: Mnemonic;
  encrypted?: string;
} & CoinAccountDetails

export type CreditDetails = {
  payee: string,
  accountNumber: string,
}
