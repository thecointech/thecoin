import { ProcessRecord } from "@the-coin/utilities/Firestore";
import { BillPayeePacket, ETransferPacket } from "@the-coin/types";
import { DepositInstructions } from "containers/gmail/types";

// TODO: Dedup this with definitions in service

export type InstructionPacket = BillPayeePacket|ETransferPacket|DepositInstructions;
export type TransferRecord = {
  transfer: {
    value: number
  }
} & ProcessRecord;

export type TransferData = {
  record: TransferRecord,
  instruction: InstructionPacket
}

export type TransferRenderer = (transfer: TransferData) => JSX.Element;
