import type { EventSection } from "@thecointech/scraper-agent/types";

export enum BankTypes { credit = 'credit', chequing = 'chequing', both = 'both' }
export type BankType = keyof typeof BankTypes;
export type ActionType = 'visaBalance'|'chqBalance'|'chqETransfer';

export type BankConfig = {
  name: string,
  url: string,
  username: string
  password: string,
}

export type BankEvents = {
  events: EventSection,
} & BankConfig;

export type ScrapingConfig = {
    [BankTypes.credit]?: BankEvents,
    [BankTypes.chequing]?: BankEvents
  } | {
    [BankTypes.both]: BankEvents
  }
