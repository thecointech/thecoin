import { Contract, Wallet } from "ethers";
import { ConnectContract } from "@the-coin/contract";
import { DepositData } from "./types";
import { log } from "@the-coin/logging";
import { Transaction } from "@the-coin/shared/containers/Account/types";

let _contract: Contract;


export async function InitContract(wallet: Wallet) : Promise<Contract> {
  if (_contract == null)
  {
    //log.debug({address: encrypted.address}, 'Decrypting contract for {address}');
    // const TCWallet = await Wallet.fromEncryptedJson(JSON.stringify(encrypted), key, () => {
    //   // Do nothing
    // });
    _contract = await ConnectContract(wallet);
  }
  return _contract;
}

type EthersTx = {
  hash: string;
  wait: () => Promise<void>;
}

export async function startTheTransfer(deposit: DepositData)
{
  const {record, instruction} = deposit;
  const {address} =instruction;
  if (!record.processedTimestamp)
    throw new Error("Cannot complete transfer without speficying Processed Timestamp")
  log.debug({address}, `Transfering ${record.transfer.value} to {address}`);

  const tx: EthersTx = await _contract.coinPurchase(
    address,
    record.transfer.value,
    0,
    record.processedTimestamp.seconds
  );
  return tx;
}

export async function waitTheTransfer(tx: EthersTx)
{
  log.trace({hash: tx.hash}, `Awaiting transfer: {hash}`);
  await tx.wait();
  log.debug({hash: tx.hash}, `Completed transfer: {hash}`);
  return tx.hash;
}

export async function completeTheTransfer(deposit: DepositData) : Promise<Transaction>
{
  const tx = await startTheTransfer(deposit);
  const hash = await waitTheTransfer(tx);
  return {
    txHash: hash,
    balance: 0,
    date: new Date(),
    change: deposit.record.transfer.value, 
    completed: new Date(),
    counterPartyAddress: deposit.instruction.address, 
    logEntry: "Manually Added"
  }
  // const contract = await GetContract();
  // const {record, instruction} = deposit;
  // const {address} =instruction;
  // if (!record.processedTimestamp)
  //   throw new Error("Cannot complete transfer without speficying Processed Timestamp")
  // log.debug({address}, `Transfering ${record.transfer.value} to {address}`);

  // const tx = await contract.coinPurchase(
  //   address,
  //   record.transfer.value,
  //   0,
  //   record.processedTimestamp.seconds
  // );
  // log.trace({hash: tx.hash}, `Awaiting transfer: {hash}`);
  // await tx.wait();
  // log.debug({hash: tx.hash}, `Completed transfer: {hash}`);
  // deposit.record.hash = tx.hash;
  // return tx.hash;
}
