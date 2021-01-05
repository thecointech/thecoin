import { eTransferData } from "@the-coin/tx-gmail/types";
import { Transaction as BlockchainRecord } from "@the-coin/shared/containers/Account";
import { TransferRecord } from "@the-coin/tx-processing/base/types";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";

export type TransactionRecord = {

  action: UserAction,
  address: string,
  data?: TransferRecord, // final/database data.  Can be set directly to db

  database?: TransferRecord, // current database record
  email?: eTransferData, // data from e-transfers
  bank?: BankRecord, // data from bank
  blockchain?: BlockchainRecord, // data from blockchain
}
