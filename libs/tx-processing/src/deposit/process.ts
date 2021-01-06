
import { RbcApi, ETransferErrorCode, DepositResult } from "@the-coin/rbcapi";

import { GetActionDoc } from "@the-coin/utilities/User";
import { GetAccountCode } from "../BrokerTransferAssistant";
import { log } from "@the-coin/logging";
import { IsValidAddress } from "@the-coin/utilities";
import { eTransferData } from "@the-coin/tx-gmail";
import { DepositRecord } from "@the-coin/tx-firestore";

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

  const code = await GetAccountCode(address)
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
