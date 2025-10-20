import type { ProcessResults } from "@thecointech/scraper-agent/types";

export enum BankTypes { credit = 'credit', chequing = 'chequing', both = 'both' }
export type BankType = keyof typeof BankTypes;
export type ActionType = 'visaBalance'|'chqBalance'|'chqETransfer';

export type BankIdent = {
  name: string,
  url: string,
}
export type BankConfig = {
  username: string
  password: string,
} & BankIdent;

export type BankEvents = ProcessResults & BankConfig;

export type ScrapingConfig = {
    [BankTypes.credit]?: BankEvents,
    [BankTypes.chequing]?: BankEvents
  } | {
    [BankTypes.both]: BankEvents
  }
