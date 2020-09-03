import { ProcessRecord } from "@the-coin/utilities/firestore";
import { BillPayeePacket, ETransferPacket } from "@the-coin/types";
import {gmail_v1} from 'googleapis';
// TODO: Dedup this with definitions in service

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


export type InstructionPacket = BillPayeePacket|ETransferPacket|DepositInstructions;
export type TransferRecord = {
  transfer: {
    value: number
  }
} & ProcessRecord;

export type TransferData = {
  record: TransferRecord,
  instruction: InstructionPacket,
  isComplete?: boolean,
}

export enum PurchaseType {
  etransfer = "etransfer",
  deposit = "deposit",
  other = "other",
}
export type DepositRecord = {
  type: PurchaseType; // One of eTransfer, directDeposit, other, etc

} & TransferRecord;

export type TransferRenderer = (transfer: TransferData) => JSX.Element;

