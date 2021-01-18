import { Contract, Wallet } from "ethers";
import { ConnectContract } from "@the-coin/contract";
import { Deposit } from "./types";
import { log } from "@the-coin/logging";
import { Transaction } from "@the-coin/tx-blockchain";
import { DateTime } from "luxon";

let _contract: Contract;


export async function InitContract(wallet: Wallet) : Promise<Contract> {
  if (_contract == null)
  {
    _contract = await ConnectContract(wallet);
  }
  return _contract;
}

type EthersTx = {
  hash: string;
  wait: () => Promise<void>;
}

export async function startTheTransfer(deposit: Deposit)
{
  const {record, etransfer } = deposit;
  const {address} = etransfer;
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

export async function completeTheTransfer(deposit: Deposit) : Promise<Transaction>
{
  const tx = await startTheTransfer(deposit);
  const hash = await waitTheTransfer(tx);
  return {
    txHash: hash,
    balance: 0,
    date: new DateTime(),
    change: deposit.record.transfer.value,
    completed: new DateTime(),
    counterPartyAddress: deposit.etransfer.address,
    logEntry: "Manually Added"
  }
}
