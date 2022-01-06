import type { eTransferData } from "@thecointech/tx-gmail";
import { ActionDictionary, ActionType, AnyAction } from "@thecointech/broker-db";
import { DateTime } from "luxon";
import { Transaction } from "@thecointech/tx-blockchain/";
import { Decimal } from "decimal.js-light";

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
  data: {
    type: ActionType,
    id: string;  // InitialID
    initiated: DateTime;
    fiat?: Decimal;
    coin?: Decimal;
  },
  // We assume all records are in our database
  database: AnyAction | null; // current database record
  email: eTransferData | null; // data from e-transfers
  bank: (null|BankRecord)[]; // data from bank, can be multiple in case of failed e-transfers
  blockchain: (null|Transaction)[]; // data from blockchain
}

export type User = {
  names: string[];
  address: string;
}
export type UserReconciled = {
  transactions: ReconciledRecord[];
} & User;

export type Reconciliations = UserReconciled[];
