import { Contract, Wallet } from "ethers";
import encrypted from './account.json';
import {key} from './account-secret.json';
import { ConnectContract } from "@the-coin/contract";
import { DepositData } from "./types";
import { log } from "logging";

let _contract: Contract|null = null;

export async function GetContract() : Promise<Contract> {
  if (_contract == null)
  {
    log.debug({address: encrypted.address}, 'Decrypting contract for {address}');
    const TCWallet = await Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
    _contract = await ConnectContract(TCWallet);
  }
  return _contract!;
}


export async function completeTheTransfer(deposit: DepositData)
{
  const contract = await GetContract();
  const {record, instruction} = deposit;
  const {address} =instruction;
  log.debug({address}, `Transfering ${record.transfer.value} to {address}`);

  const tx = await contract.coinPurchase(
    address,
    record.transfer.value,
    0,
    record.processedTimestamp.seconds
  );
  log.trace({hash: tx.hash}, `Awaiting transfer: {hash}`);
  await tx.wait();
  log.debug({hash: tx.hash}, `Completed transfer: {hash}`);
  deposit.record.hash = tx.hash;
  return tx.hash;
}
