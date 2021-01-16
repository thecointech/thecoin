import { eTransferData } from "@the-coin/tx-gmail";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";
import { DbRecords, BaseTransactionRecord } from "@the-coin/tx-firestore";
import { Transaction } from "@the-coin/tx-blockchain/";
import { ObsoleteRecords } from '@the-coin/tx-firestore/obsolete';


declare global {

  ////////////////////////////////
  // input types
  type BankRecord = {
    Date: DateTime;
    Description: string;
    Details?: string;
    Amount: number;
  }

  type AllData = {
    eTransfers: eTransferData[];
    dbs: DbRecords;
    bank: BankRecord[];
    blockchain: Transaction[];

    obsolete: ObsoleteRecords;
    cancellations: Map<BankRecord, BankRecord>;
  }

  ////////////////////////////////
  // ouput type

  type ReconciledRecord = {
    action: UserAction;
    data: BaseTransactionRecord; // final/database data.  Can be set directly to db

    database: BaseTransactionRecord | null; // current database record
    email: eTransferData | null; // data from e-transfers
    bank: BankRecord[]; // data from bank, can be multiple in case of failed e-transfers
    blockchain: Transaction | null; // data from blockchain

    refund?: Transaction; // If this tx was refunded, fill this out
    cancelled?: BankRecord; // If this etransfer was cancelled, fill this out
  }

  type User = {
    names: string[];
    address: string;
  }
  type UserReconciled = {
    transactions: ReconciledRecord[];
  } & User;

  type Reconciliations = UserReconciled[];

  var original: AllData;
}

globalThis.original = {} as any;
