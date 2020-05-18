import { DepositData } from "./types";
import { RbcApi, ETransferErrorCode } from "RbcApi";
import { Contract } from "ethers";
import { PurchaseType, DepositRecord } from "containers/TransferList/types";
import { setETransferLabel } from "./addFromGmail";
import { GetActionDoc } from "@the-coin/utilities/User";
import { GetAccountCode } from "containers/BrokerTransferAssistant/Wallet";
import { Transaction } from "@the-coin/shared/containers/Account";


export async function processDeposit(deposit: DepositData, rbcApi: RbcApi, contract: Contract, progressCb: (v: string) => void) {
  // We assume types of 'other' (wages) were successfully deposited
  let wasDeposited = deposit.record.type === PurchaseType.other || !!deposit.bank;

  if (deposit.isComplete) {
    if (deposit.instruction.raw && !wasDeposited) {
      // This deposit should be successful, but hasn't been deposited yet.
      wasDeposited = await depositInBank(deposit, rbcApi, progressCb)
    }

    if (!deposit.tx) {
      if (wasDeposited) {
        // Complete this deposit (send $$ to user)
        deposit.tx = await completeTheTransfer(deposit, contract, progressCb);
        deposit.record.hash = deposit.tx.txHash;
      }
      else {
        // Remove the completed timestamp
        progressCb('Skipping TheCoin transfer because deposit not completed');
        deposit.record.completedTimestamp = null;
      }
    }
    else if (!wasDeposited) {
      alert('We have a completed deposit that seems invalid');
      deposit.record.completedTimestamp = null;
    }
    if (deposit.record.hash) {
      progressCb('Storing Deposit in DB');
      await storeInDB(deposit.instruction.address, deposit.record);
    }
  }
  if (deposit.instruction.raw)
  {
    await setETransferLabel(deposit.instruction.raw, wasDeposited ? "deposited" : "rejected");
  }
  progressCb('Completed deposit');
}

async function depositInBank(deposit: DepositData, rbcApi: RbcApi, progressCb: (v: string) => void) {
  progressCb("Depositing in Bank");
  const { instruction, record } = deposit;
  const recieved = record.recievedTimestamp.toDate().toDateString();
  const code = await GetAccountCode(instruction.address)
  const prefix = `${instruction.name}/${recieved}`;
  const response = await rbcApi.depositETransfer(prefix, instruction.depositUrl, code, progressCb);
  if (response.code !== ETransferErrorCode.Success) {
    if (response.code === ETransferErrorCode.AlreadyDeposited)
    {
      console.warn(`Deposit from ${instruction.name} - ${recieved} already deposited, but missing from bank`);
    }
    else {
      alert("Could not deposit: " + response.message);
      return false;
    }
  }
  return true;
}

async function storeInDB(address: string, record: DepositRecord) {
  const userDoc = await GetActionDoc(address, "Buy", record.hash);

  // const purchaseData = await purchaseDoc.get()
  // if (purchaseData.exists) {
  //   throw new Error(`Purchase ${purchaseId} already exists: check tx ${JSON.stringify(purchaseData.data())}`)
  // }

  var result = await userDoc.set(record);
  if (result) {
    console.log(result.writeTime);
  }
}

async function completeTheTransfer(deposit: DepositData, contract: Contract, progressCb: (v: string) => void) : Promise<Transaction>
{
  progressCb('Beginning TheCoin transfer');
  const {record, instruction} = deposit;
  const {address} =instruction;
  const tx = await contract.coinPurchase(
    address,
    record.transfer.value,
    0,
    record.processedTimestamp.seconds
  );
  progressCb('Awaiting TheCoin transfer:\n' + tx.hash);
  await tx.wait();
  return {
    balance: -1,
    change: -record.transfer.value,
    counterPartyAddress: address,
    date: record.processedTimestamp.toDate(),
    logEntry: "We just sent it",
    txHash: tx.hash,
    completed: new Date(),
  }
}
