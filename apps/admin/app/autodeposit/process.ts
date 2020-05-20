import { DepositData } from "./types";
import { RbcApi, ETransferErrorCode } from "RbcApi";
import { DepositRecord } from "containers/TransferList/types";
import { GetActionDoc } from "@the-coin/utilities/User";
import { GetAccountCode } from "containers/BrokerTransferAssistant/Wallet";
import { log } from "logging";


export function addNewEntries(deposits: DepositData[], moreDeposits: DepositData[])
{
  return [...deposits, ...moreDeposits]
    .sort((a, b) => a.record.recievedTimestamp.seconds - b.record.recievedTimestamp.seconds);
}

export async function depositInBank(deposit: DepositData, rbcApi: RbcApi, progressCb: (v: string) => void) {
  log.debug(`Attempting deposit of: $${deposit.record.fiatDisbursed}, settled on ${deposit.record.processedTimestamp.toDate().toDateString()}`);
  const { instruction, record } = deposit;
  const recieved = record.recievedTimestamp.toDate().toDateString();
  const code = await GetAccountCode(instruction.address)
  const prefix = `${instruction.name}/${recieved}`;
  const result = await rbcApi.depositETransfer(prefix, instruction.depositUrl, code, progressCb);
  log.debug(`Deposit result: ${ETransferErrorCode[result.code]}`);
  return result;
}

export async function storeInDB(address: string, record: DepositRecord) {
  const userDoc = GetActionDoc(address, "Buy", record.hash);

  var result = await userDoc.set(record);
  if (!result) {
    log.error({address: address, hash: record.hash},
      "Failed to store tx {hash} for address {address}");
    return false;
  }

  log.debug({address: address, hash: record.hash},
    "Stored tx {hash} for address {address} at with result: " + result.writeTime);
  return true;
}
