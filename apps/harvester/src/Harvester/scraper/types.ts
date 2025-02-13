import type { HistoryRow } from "@thecointech/scraper/table";
import type currency from "currency.js";
import type { DateTime } from "luxon";

export type BankTypes = 'credit'|'chequing'|'both';
export type ActionTypes = 'visaBalance'|'chqBalance'|'chqETransfer';

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
