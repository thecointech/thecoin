import { DepositData } from "./types";
import { Transaction } from "@the-coin/shared/containers/Account";
import { weSellAt } from "@the-coin/shared/containers/FxRate";
import { FXRate } from '@the-coin/pricing'
import { toHuman, IsValidAddress, NormalizeAddress, toCoin } from "@the-coin/utilities";
import { fromMillis } from "utils/Firebase";


export async function addFromBlockchain(deposits: DepositData[], transfers: Transaction[], fxRates: FXRate[])
{
  // Let's verify all hash'es, and see if we can find 
  // appropriate transfers for any that do not have hashes


  const allTransfers = transfers
    .map(transfer => ({
      ...transfer,
      counterPartyAddress: NormalizeAddress(transfer.counterPartyAddress),
    }))
    // Remove TheCoin account
    .filter(tx => tx.counterPartyAddress != "0x4F107B6633A4B3385C9E20945144C59CE4FF2DEF")
    // only care about sales, remove purchases
    .filter(tx => tx.change < 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const d of deposits)
  {
    addCoinValue(d, fxRates);
  }

  for (const d of deposits)
  {
    // If we have a hash, verify the details.
    if (d.record.hash)
    {
      if (!VerifyLinkedTx(d, allTransfers, fxRates))
      {
        console.error("** unverified deposit **" + d.instruction.name);
      }
    }
  }

  for (const d of deposits) 
  {
    if (!d.record.hash)
      TryAddHash(d, allTransfers, fxRates);
  }

  buildUnmatchedBCEntries(deposits, allTransfers, fxRates);

  return deposits;
}

function addCoinValue(deposit: DepositData, fxRates: FXRate[])
{
  if (deposit.record.transfer.value < 0) {
    if (deposit.record.processedTimestamp) {
      const fxRate = weSellAt(fxRates, deposit.record.processedTimestamp.toDate());
      deposit.record.transfer.value = toCoin(deposit.record.fiatDisbursed / fxRate);
    }
  }
}

function VerifyLinkedTx(deposit: DepositData, allTransfers: Transaction[], fxRates: FXRate[]) {
  const tx = allTransfers.find(t => t.txHash === deposit.record.hash);
  if (!tx)
  {
    console.error("Could not find account tx for: " + deposit.record.hash)
    return false;
  }

  return VerifyDeposit(deposit, tx, allTransfers, fxRates);
}

function VerifyDeposit(deposit: DepositData, tx: Transaction, allTransfers: Transaction[], fxRates: FXRate[])
{
  const record = deposit.record;

  // Now, lets just double check the details
  if (tx.date.toDateString() != record.processedTimestamp?.toDate().toDateString())
  {
    console.warn(`Mismatched dates: ${deposit.instruction.name} - ${deposit.record.fiatDisbursed} on ${record.recievedTimestamp.toDate().toDateString()}`);
    return false;
  }

  const txValue = toHuman(weSellAt(fxRates, tx.date) * tx.change, true);
  const txDelta = ((tx.date.getTime() / 1000) - deposit.record.recievedTimestamp.seconds) / (60*60*24);
  if (-txValue != deposit.record.fiatDisbursed)
  {
    console.warn(`Mismatched Amounts: ${deposit.instruction.name} -  ${txValue} != ${deposit.record.fiatDisbursed}`);
  }
  else if (txDelta > 6) {
    console.warn(`Delta on deposit is large: ${txDelta} - ${deposit.instruction.name} ${deposit.record.recievedTimestamp.toDate().toDateString()}`);
    // we still allow this through
  }
  setTransaction(deposit, tx, allTransfers);
  return true;
}

function TryAddHash(deposit: DepositData, allTransfers: Transaction[], fxRates: FXRate[])
{
  let { address } = deposit.instruction;
  if (!IsValidAddress(address)) {
    console.error("Cannot process invalid address");
    return;
  }
  address = NormalizeAddress(address);
  // Find all un-categorized transfers for this person
  const accountTransfers = allTransfers.filter(t => t.counterPartyAddress === address);

  // Does the first one match the deposit?
  if (accountTransfers.length > 0)
  {
    const tx =accountTransfers[0];
    // Now, find one that matches the deposit
    const matches = VerifyDeposit(deposit, tx, allTransfers, fxRates);
    if (!matches) {
      if (deposit.bank)
      {
        console.error("We don't have a transaction, but we did deposit this");
      }
    }
  }
}

function setTransaction(deposit: DepositData, tx: Transaction, allTransfers: Transaction[])
{
  deposit.record.hash = tx.txHash;
  deposit.record.processedTimestamp = fromMillis(tx.date.getTime());
  if (!deposit.record.completedTimestamp) {
    deposit.record.completedTimestamp = fromMillis(tx.date.getTime())
  }
  allTransfers.splice(allTransfers.indexOf(tx), 1);
}


function buildUnmatchedBCEntries(deposits: DepositData[], allTransfers: Transaction[], fxRates: FXRate[])
{
  //const myOtherWallet: "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4";
  return allTransfers.map(tx => {

    // First, do have this user anywhere?
    const deposit = deposits.find(d => d.instruction.address == tx.counterPartyAddress);
    const txValue = toHuman(weSellAt(fxRates, tx.date) * tx.change, true);
    return { 
      name: deposit?.instruction.name,
      value: txValue,
    }
  });
}
