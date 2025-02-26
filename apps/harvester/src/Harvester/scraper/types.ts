import type { HistoryRow } from "@thecointech/scraper/table";
import type currency from "currency.js";
import type { DateTime } from "luxon";

export type BankType = 'credit'|'chequing'|'both';
export type ActionType = 'visaBalance'|'chqBalance'|'chqETransfer';

export type VisaBalanceResult = {
  balance: currency;
  dueDate: DateTime;
  dueAmount: currency;
  history?: HistoryRow[]; // NOT SAVED
}

export type ChequeBalanceResult = {
  balance: currency;
}

export type ETransferResult = {
  confirm: string,
}
