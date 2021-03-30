import { DepositRecord } from "@thecointech/tx-firestore";
import { eTransferData } from "@thecointech/tx-gmail";
import { Timestamp } from "@thecointech/utilities/firestore";
import { DateTime } from "luxon";

export const toTimestamp = (d: DateTime) => Timestamp.fromMillis(d.toMillis());
export type Deposit = {
  etransfer: eTransferData,
  record: DepositRecord,
  isComplete: boolean,
}
