import { DateTime } from "luxon";

export type RbcTransaction = {
  AccountType: string;
  AccountNumber: string;
  TransactionDate: DateTime;
  ChequeNumber?: number;
  Description1?: string;
  Description2?: string;
  CAD?: number;
  USD?: number;
}
