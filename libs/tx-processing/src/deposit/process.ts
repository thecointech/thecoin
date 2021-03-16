
import { RbcApi, ETransferErrorCode, DepositResult } from "@thecointech/rbcapi";

import { GetActionDoc } from "@thecointech/utilities/User";
import { GetAccountCode } from "@thecointech/utilities/Referrals";
import { log } from "@thecointech/logging";
import { IsValidAddress } from "@thecointech/utilities";
import { eTransferData } from "@thecointech/tx-gmail";
import { DepositRecord } from "@thecointech/tx-firestore";
import { getSigner } from "@thecointech/accounts";

export async function depositInBank(etransfer: eTransferData, rbcApi: RbcApi, progressCb: (v: string) => void) : Promise<DepositResult> {

  const {address, name, depositUrl, cad, recieved } = etransfer;
  log.debug(`Attempting deposit of: $${cad}, recieved on ${recieved.toSQLDate()}`);

  if (!address || !IsValidAddress(address))
  {
    return {
      message: "Cannot complete deposit without a valid address",
      code: ETransferErrorCode.InvalidInput
    }
  }
  if (!depositUrl)
  {
    return {
      message: "Cannot complete deposit without a depositUrl",
      code: ETransferErrorCode.InvalidInput
    }
  }

  const bta = await getSigner("BrokerTransferAssistant");
  const code = await GetAccountCode(address, bta);
  const prefix = `${name}/${recieved.toSQLDate()}`;
  const result = await rbcApi.depositETransfer(prefix, depositUrl, code, progressCb);
  log.debug(`Deposit result: ${ETransferErrorCode[result.code]}`);
  return result;
}

export async function storeInDB(address: string, record: DepositRecord) {
  const userDoc = GetActionDoc(address, "Buy", record.hash);
  // set always returns null on Node
  await userDoc.set(record);
  log.debug({address: address, hash: record.hash},
    "Stored tx {hash} for address {address}");
  return true;
}
