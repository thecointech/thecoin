import { eTransferData } from "@the-coin/tx-gmail/types";
import { Transaction as BlockchainRecord, Transaction } from "@the-coin/shared/containers/Account";
import { TransferRecord } from "@the-coin/tx-processing/base/types";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";
import { DbRecords } from "@the-coin/tx-firestore";

export type BankRecord = {
  Date: DateTime,
	Description: string,
	Details: string,
	Amount: number
}

export type TransactionRecord = {
  action: UserAction,
  data: TransferRecord, // final/database data.  Can be set directly to db

  database?: TransferRecord, // current database record
  email?: eTransferData, // data from e-transfers
  bank?: BankRecord, // data from bank
  blockchain?: BlockchainRecord, // data from blockchain
}

type UserTransactions = {
  name: string,
  address: string,
  transctions: TransactionRecord[],
}

export type AllTransactions = UserTransactions[]

export type AllData = {
  eTransfers: eTransferData[];
  dbs: DbRecords;
  bank: any[];
  blockchain: Transaction[];
}
