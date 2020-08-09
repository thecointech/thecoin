import { DepositRecord, DepositInstructions } from '../base/types';
import { Timestamp } from '@the-coin/types/FirebaseFirestore';
import { Transaction } from '@the-coin/shared/containers/Account';
import { DateTime } from 'luxon';

export interface OldPurchseDB {
  coin: number,
  fiat: number,
  recieved: Timestamp,
  settled: Timestamp,
  completed: Timestamp,
  txHash: string,
  emailHash: string
}


export type BankRecord = {
  Date: DateTime,
	Description: string,
	Details: string,
	Amount: number
}

export type DepositData = {

  // Data to be saved to the database
  record: DepositRecord,

  // Instructions used to complete the transaction
  instruction: DepositInstructions,

  // Any existing DB records
  db: DepositRecord|DepositRecord[]|null,

  // A matching entry from the bank (to verify)
  bank: BankRecord|null,

  // A matching entry from our ethereum account
  tx: Transaction|null,

  // Set to true when we have verified all info.
  isComplete?: boolean,
};
