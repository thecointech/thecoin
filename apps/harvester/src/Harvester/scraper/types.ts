import type { EventSection } from "@thecointech/scraper-agent/types";

export enum BankTypes { credit = 'credit', chequing = 'chequing', both = 'both' }
export type BankType = keyof typeof BankTypes;
export type ActionType = 'visaBalance'|'chqBalance'|'chqETransfer';

export type ScrapingConfig = {
    [BankTypes.credit]?: EventSection,
    [BankTypes.chequing]?: EventSection
  } | {
    [BankTypes.both]: EventSection
  }
