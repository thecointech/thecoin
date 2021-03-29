
import { Deposit } from "./types";
import { log } from "@thecointech/logging";
import { Transaction } from "@thecointech/tx-blockchain";
import { TheCoin } from '@thecointech/contract';
import { DateTime } from "luxon";

type EthersTx = {
  hash: string;
  wait: () => Promise<void>;
}

export async function startTheTransfer(deposit: Deposit, contract: TheCoin)
{
  const {record, etransfer } = deposit;
  const {address} = etransfer;
  if (!record.processedTimestamp)
    throw new Error("Cannot complete transfer without speficying Processed Timestamp")
  log.debug({address}, `Transfering ${record.transfer.value} to {address}`);

  const tx: EthersTx = await contract.coinPurchase(
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

export async function completeTheTransfer(deposit: Deposit, contract: TheCoin) : Promise<Transaction>
{
  const tx = await startTheTransfer(deposit, contract);
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
