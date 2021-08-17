
////////////////////////////////
// ouput type
import { Timestamp } from "@thecointech/firestore";
import { eTransferData } from "@thecointech/tx-gmail";
import { DateTime } from 'luxon';

export type UserAction = "Buy"|"Sell"|"Bill";
export type PurchaseType = "other"|"etransfer"|"deposit";

// All transaction types
export type BaseTransactionRecord = {
  transfer: {
    value: number
  }
  sourceId?: string; // A unique identifier of the source data
  recievedTimestamp: Timestamp,
  processedTimestamp?: Timestamp,
  completedTimestamp?: Timestamp,
  hash: string,
  hashRefund?: string,
  confirmed: boolean,
  fiatDisbursed: number
  confirmation?: number;

  // For deposits
  type?: PurchaseType;
}

export type BankRecord = {
  Date: DateTime;
  Description: string;
  Details?: string;
  Amount: number;
}

export type Transaction = {
  txHash?: string;
  date: DateTime;
  completed?: DateTime;
  change: number;
  logEntry: string;
  balance: number;
  counterPartyAddress: string;
}


export type ReconciledRecord = {
  action: UserAction;
  data: BaseTransactionRecord; // final/database data.  Can be set directly to db

  database: BaseTransactionRecord | null; // current database record
  email: eTransferData | null; // data from e-transfers
  bank: BankRecord[]; // data from bank, can be multiple in case of failed e-transfers
  blockchain: Transaction | null; // data from blockchain

  refund?: Transaction; // If this tx was refunded, fill this out
  cancelled?: BankRecord; // If this etransfer was cancelled, fill this out

  notes?: string;
}

export type User = {
  names: string[];
  address: string;
  data?: {
    referrer: string;
    created: Timestamp
  };
}

export type UserReconciled = {
  transactions: ReconciledRecord[];
} & User;

export type Reconciliations = UserReconciled[];

