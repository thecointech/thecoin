import type { eTransferData } from "@thecointech/tx-gmail";
import { ActionDictionary, ActionType, AnyAction, TransitionDelta } from "@thecointech/broker-db";
import { DateTime } from "luxon";
import Decimal from 'decimal.js-light';;
import { Transaction } from '@thecointech/tx-blockchain';

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
  Plugin: ActionDictionary<"Plugin">;
}

export type AllData = {
  eTransfers: eTransferData[];
  dbs: DbRecords;
  bank: BankRecord[];
  blockchain: Transaction[];
}

////////////////////////////////
// ouput type

export type ReconciledHistory = {
  state: TransitionDelta, // State prior to transition
  delta: TransitionDelta, // Changes resulting from transition
  // NOTE: undefined means we haven't looked for it
  // null means we haven't found it.
  bank?: BankRecord | null,
  blockchain?: Transaction | null,
}
export type ReconciledRecord = {
  data: {
    type: ActionType,
    id: string;  // InitialID
    initiated: DateTime;
    fiat?: Decimal;
    coin?: Decimal;

    history: ReconciledHistory[],
  },
  // We assume all records are in our database
  database: AnyAction | null; // current database record
  email: eTransferData | null; // data from e-transfers
}

export type User = {
  names: string[];
  address: string;
}
export type UserReconciled = {
  transactions: ReconciledRecord[];
} & User;

export type Reconciliations = UserReconciled[];
