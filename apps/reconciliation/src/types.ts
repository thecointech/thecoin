import { eTransferData } from "@the-coin/tx-gmail";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";
import { DbRecords, BaseTransactionRecord } from "@the-coin/tx-firestore";
import { Transaction } from "@the-coin/tx-blockchain/";

////////////////////////////////
// input types
export type BankRecord = {
  Date: DateTime,
	Description: string,
	Details: string,
	Amount: number
}

export type AllData = {
  eTransfers: eTransferData[];
  dbs: DbRecords;
  bank: BankRecord[];
  blockchain: Transaction[];
}

////////////////////////////////
// ouput type

export type TransactionRecord = {
  action: UserAction,
  data: BaseTransactionRecord, // final/database data.  Can be set directly to db

  database: BaseTransactionRecord|null, // current database record
  email: eTransferData|null, // data from e-transfers
  bank: BankRecord|null, // data from bank
  blockchain: Transaction|null, // data from blockchain
}

type UserTransactions = {
  name: string,
  address: string,
  transctions: TransactionRecord[],
}

export type AllTransactions = UserTransactions[]

