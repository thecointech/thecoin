import { DepositData } from "./types";
import { Transaction } from "@the-coin/shared/containers/Account";
import { weSellAt } from "@the-coin/shared/containers/FxRate";
import { FXRate } from '@the-coin/pricing'
import { toHuman, IsValidAddress, NormalizeAddress, toCoin } from "@the-coin/utilities";
import { fromMillis, toTimestamp } from "utils/Firebase";
import { PurchaseType } from "containers/TransferList/types";


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

  /*const unmatched = */buildUnmatchedBCEntries(deposits, allTransfers, fxRates);
  // Do any of these unmatched deposits match un-matched deposits in the list?
  // for (const d of deposits)
  // {
  //   if (!d.record.hash)
  //     TryMatchUnmatched(d, unmatched);
  // }

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
    const dateMatch = accountTransfers.find(t => Math.abs(deposit.record.processedTimestamp.seconds - (t.date.getTime() / 1000)) < 60)
    //const dateMatch = accountTransfers.find(t => t.date == deposit.record.processedTimestamp.toDate())
    const tx = dateMatch ?? accountTransfers[0];
    // Now, find one that matches the deposit
    const matches = VerifyDeposit(deposit, tx, allTransfers, fxRates);
    if (!matches) {
      if (deposit.bank)
      {
        console.error(`Deposited tx from ${deposit.instruction.name} but cannot find matching hash`);
      }
    }
  }
}

// function TryMatchUnmatched(deposit: DepositData, allTransfers: DepositData[])
// {
//   // Find
// }

function setTransaction(deposit: DepositData, tx: Transaction, allTransfers: Transaction[])
{
  deposit.tx = tx;
  deposit.record.hash = tx.txHash;
  deposit.record.processedTimestamp = fromMillis(tx.date.getTime());
  if (!deposit.record.completedTimestamp) {
    deposit.record.completedTimestamp = fromMillis(tx.date.getTime())
  }
  allTransfers.splice(allTransfers.indexOf(tx), 1);
}


function buildUnmatchedBCEntries(deposits: DepositData[], allTransfers: Transaction[], fxRates: FXRate[]) : DepositData[]
{
  //const myOtherWallet: "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4";
  // For each transaction, is there anything that might be matching?
  return allTransfers.map(tx => {

    // First, do have this user anywhere?
    const deposit = deposits.find(d => d.instruction.address && NormalizeAddress(d.instruction.address) == tx.counterPartyAddress);
    const txValue = toHuman(weSellAt(fxRates, tx.date) * tx.change, true);

    const r: DepositData = {
      instruction: {
        name: deposit?.instruction.name,
        email: deposit?.instruction.email,
      },
      record: {
        transfer: {
          value: tx.change,
        },
        recievedTimestamp: toTimestamp(tx.date),
        processedTimestamp: toTimestamp(tx.date),
        completedTimestamp: toTimestamp(tx.completed),
        hash: tx.txHash,
        fiatDisbursed: txValue,
        confirmed: true,
        type: PurchaseType.other,
      },
      tx: tx,
      db: null,
      bank: null,
    };
    return r;
  });
}
