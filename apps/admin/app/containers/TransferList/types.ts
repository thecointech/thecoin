import { BaseTransactionRecord } from "@thecointech/tx-firestore";
import { eTransferData } from "@thecointech/tx-gmail";
import { InstructionPacket } from "@thecointech/utilities/src/VerifiedAction";

export type TransactionData = {
  record: BaseTransactionRecord,
  instruction: InstructionPacket|eTransferData,
  isComplete?: boolean,
}
export type TransferRenderer = (transfer: TransactionData) => JSX.Element;
