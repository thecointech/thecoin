import { DepositRecord } from "@the-coin/tx-firestore";
import { eTransferData } from "@the-coin/tx-gmail";
import { Timestamp } from "@the-coin/utilities/firestore";
import { DateTime } from "luxon";

export const toTimestamp = (d: DateTime) => Timestamp.fromMillis(d.toMillis());
export type Deposit = {
  etransfer: eTransferData,
  record: DepositRecord,
  isComplete: boolean,
}
