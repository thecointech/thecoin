import { DepositData } from "./types";
import { RbcApi, ETransferErrorCode, DepositResult } from "@the-coin/rbcapi";
import { DepositRecord } from "../base/types";
import { GetActionDoc } from "@the-coin/utilities/User";
import { GetAccountCode } from "../BrokerTransferAssistant";
import { log } from "@the-coin/logging";
import { IsValidAddress } from "@the-coin/utilities";


export function addNewEntries(deposits: DepositData[], moreDeposits: DepositData[])
{
  return [...deposits, ...moreDeposits]
    .sort((a, b) => a.record.recievedTimestamp.seconds - b.record.recievedTimestamp.seconds);
}

export async function depositInBank(deposit: DepositData, rbcApi: RbcApi, progressCb: (v: string) => void) : Promise<DepositResult> {
  const { instruction, record } = deposit;
  log.debug(`Attempting deposit of: $${record.fiatDisbursed}, settled on ${record.processedTimestamp?.toDate().toDateString()}`);
  const {address, name, depositUrl} = instruction;
  if (!address || IsValidAddress(address))
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

  const recieved = record.recievedTimestamp.toDate().toDateString();
  const code = await GetAccountCode(address)
  const prefix = `${name}/${recieved}`;
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
