import { eTransferData } from "@thecointech/tx-gmail";
import { ActionDictionary, ActionType } from "@thecointech/broker-db";
import { DateTime } from "luxon";
import { Transaction } from "@thecointech/tx-blockchain/";

////////////////////////////////
// input types
export type BankRecord = {
  Date: DateTime;
  Description: string;
  Details?: string;
  Amount: number;
}

export type DbRecords = {
  Buy: ActionDictionary<"Buy">;
  Sell: ActionDictionary<"Sell">;
  Bill: ActionDictionary<"Bill">;
}
export type AllData = {
  eTransfers: eTransferData[];
  dbs: DbRecords;
  bank: BankRecord[];
  blockchain: Transaction[];
}

////////////////////////////////
// ouput type

export type ReconciledRecord = {
  action: ActionType;
  // TODO: Complete db upgrade by fixing these types back to TypedAction
  data: any; // final/database data.  Can be set directly to db

  database: any | null; // current database record
  email: eTransferData | null; // data from e-transfers
  bank: BankRecord[]; // data from bank, can be multiple in case of failed e-transfers
  blockchain: Transaction | null; // data from blockchain

  refund?: Transaction; // If this tx was refunded, fill this out
  cancelled?: BankRecord; // If this etransfer was cancelled, fill this out
}

export type User = {
  names: string[];
  address: string;
}
export type UserReconciled = {
  transactions: ReconciledRecord[];
} & User;

export type Reconciliations = UserReconciled[];
