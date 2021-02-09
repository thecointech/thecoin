import { BaseTransactionRecord } from "@the-coin/tx-firestore";
import { eTransferData } from "@the-coin/tx-gmail";
import { InstructionPacket } from "@the-coin/utilities/src/VerifiedAction";

export type TransactionData = {
  record: BaseTransactionRecord,
  instruction: InstructionPacket|eTransferData,
  isComplete?: boolean,
}
export type TransferRenderer = (transfer: TransactionData) => JSX.Element;
