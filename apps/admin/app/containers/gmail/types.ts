import {gmail_v1} from 'googleapis';
import { TransferRecord } from 'containers/TransferList/types';
import { Timestamp } from '@the-coin/types/FirebaseFirestore';
import { Transaction } from '@the-coin//shared/containers/Account';

export type DepositInstructions = {
  name: string,
  email: string,
  address: string,
  recieved?: Date,
  depositUrl?: string,

  // Store the raw data
  subject?: string,
  body?: string,
  raw?: gmail_v1.Schema$Message,
}


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
  Date: Date,
	Description: string,
	Details: string,
	Amount: number
}

export type DepositData = {

  // Data to be saved to the database
  record: TransferRecord,

  // Instructions used to complete the transaction
  instruction: DepositInstructions,

  // Any existing DB records
  db: OldPurchseDB|OldPurchseDB[]|null,

  // A matching entry from the bank (to verify)
  bank: BankRecord|null,

  // A matching entry from our ethereum account
  tx: Transaction|null,

  // Set to true when we have verified all info.
  isComplete?: boolean,
};
