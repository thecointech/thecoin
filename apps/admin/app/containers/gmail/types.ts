import {gmail_v1} from 'googleapis';
import { TransferRecord } from 'containers/TransferList/types';
import { Timestamp } from '@the-coin/types/FirebaseFirestore';

export type DepositInstructions = {
  name: string,
  email: string,
  address: string,

  depositUrl: string,

  // Store the raw data
  subject: string,
  body: string,
  raw: gmail_v1.Schema$Message,
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


export type DepositData = {

  // Data to be saved to the database
  record: TransferRecord,

  // Instructions used to complete the transaction
  instruction: DepositInstructions,

  // Any existing DB records
  db: OldPurchseDB|OldPurchseDB[],

};
