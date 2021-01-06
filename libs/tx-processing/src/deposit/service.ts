import { log } from '@the-coin/logging';
import { RbcApi, ETransferErrorCode } from "@the-coin/rbcapi";
import { RatesApi } from '@the-coin/pricing';
import { toCoin, isPresent } from "@the-coin/utilities";
import { Timestamp } from "@the-coin/utilities/firestore";
import { GetActionDoc } from "@the-coin/utilities/User";
import { NextOpenTimestamp } from "@the-coin/utilities/MarketStatus";
import { depositInBank, storeInDB } from "./process";
import { waitTheTransfer, startTheTransfer } from "./contract";
import { eTransferData, FetchNewDepositEmails, setETransferLabel } from "@the-coin/tx-gmail";
import { DepositRecord, PurchaseType } from '@the-coin/tx-firestore';
import { DocumentReference } from "@the-coin/types";
import { SendDepositConfirmation } from "@the-coin/email";
import { DateTime } from "luxon";
import { Deposit, toTimestamp } from './types';

export async function setSettlementDate(record: DepositRecord) {
  const recievedAt = record.recievedTimestamp.toDate()
  const nextOpen = await NextOpenTimestamp(recievedAt);
  record.processedTimestamp = Timestamp.fromMillis(nextOpen);
  return record.processedTimestamp;
}

async function setCoinRate(record: DepositRecord) {
  const ratesApi = new RatesApi();
  const { processedTimestamp } = record;
  if (processedTimestamp == null) {
    log.error("Cannot calculate exchange rate without a processed Timestamp");
    return;
  }
  // Ok, lets get an FX result for this
  const rate = await ratesApi.getConversion(124, processedTimestamp.toMillis());
  if (rate.status != 200 || !rate.data.sell) {
    log.error(`Error fetching rate for: ${processedTimestamp.toDate()}`);
    return false;
  }

  const { sell, fxRate } = rate.data;
  const convertAt = sell * fxRate;
  record.transfer.value = toCoin(record.fiatDisbursed / convertAt);
    return true;
}

async function FillDepositDetails(etransfer: eTransferData) : Promise<Deposit|null> {
  // get users address
  const { address, recieved, cad } = etransfer;
  const record: DepositRecord = {
    confirmed: false,
    fiatDisbursed: cad.toNumber(),
    recievedTimestamp: toTimestamp(recieved),
    type: PurchaseType.etransfer,

    hash: "",
    transfer: {
      value: -1
    }
  }

  try {
    const ts = Timestamp.now();

    log.debug({ address: address, recieved: recieved.toJSDate() },
      `Processing deposit for {address}, recieved: {recieved} for ${cad}`);

    // First, can we process this?
    const processedTimestamp = await setSettlementDate(record);
    if (processedTimestamp && processedTimestamp >= ts) {
      log.debug(`Deposit cannot be processed: settles at ${processedTimestamp.toDate().toDateString()}`);
      return null;
    }

    // Set the appropriate coin rate
    if (!(await setCoinRate(record)))
      return null;
  }
  catch (e)
  {
    log.error({exceptionMessage: e.message, address: address},
      "EXCEPTION: {exceptionMessage} while processing deposit for {address}");
    return null;
  }
  return {
    etransfer,
    record,
    isComplete: false,
  }
}

export async function GetDepositsToProcess()
{
  const rawDeposits = await FetchNewDepositEmails();
  // Fill in appropriate details for pending deposits
  const depositsAsync = rawDeposits.map(FillDepositDetails);
  // complete async
  const deposits = await Promise.all(depositsAsync);
  // Remove all deposits that weren't properly filled out
  return deposits.filter(isPresent);
}

export async function ProcessUnsettledDeposits(rbcApi?: RbcApi)
{
  const deposits = await GetDepositsToProcess();
  const bank = rbcApi ?? new RbcApi();

  // for each email, we immediately try and deposit it.
  for (const deposit of deposits)
  {
    deposit.isComplete = await ProcessUnsettledDeposit(deposit, bank);
    log.debug("Deposit Completed: " + deposit.isComplete);
  }

  return deposits;
}

export async function ProcessUnsettledDeposit(deposit: Deposit, rbcApi: RbcApi)
{
  const inProgress = await initiateDeposit(deposit);
  if (!inProgress)
    return false;

  const { etransfer, record } = deposit;

  // Do the actual deposit
  const confirmation = await ProcessDepositBank(etransfer, rbcApi)
  if (!confirmation)
    return false;
  record.confirmation = confirmation;

  // Update inProgress with progress
  await inProgress.set(deposit.record);

  // Complete transfer to person
  const processed = await ProcessDepositTransfer(deposit, inProgress);

  // Update inProgress with progress
  await inProgress.set(deposit.record);

  // Mark email as complete
  if (deposit.etransfer.raw)
    await setETransferLabel(deposit.etransfer.raw, "deposited");

  // We must set this, regardless of whether or not the deposit completed (?)
  const stored = await storeInDB(deposit.etransfer.address, deposit.record);

  if (processed && stored)
  {
    await inProgress.delete();
    // Finally, email the notification
    await emailNotification(deposit);
    return true;
  }
  return false;
}

//
// Put money in the bank.  Should only return true
// if this transfer was actually completed
export async function ProcessDepositBank(etransfer: eTransferData, rbcApi: RbcApi)
{
  const result = await depositInBank(etransfer, rbcApi, log.trace);
  if (result.code != ETransferErrorCode.Success)
  {
    log.error({address: etransfer.address, errorCode: ETransferErrorCode[result?.code ?? ETransferErrorCode.UnknownError]},
      `Could not process deposit from: {address}, got {errorCode}`);
    return false;
  }
  return result.confirmation;
}

//
// Transfer the appropriate amount of Coin to client
export async function ProcessDepositTransfer(deposit: Deposit, inProgress: DocumentReference) : Promise<boolean>
{
  log.debug({address: deposit.etransfer.address, deposited: deposit.etransfer.recieved.toJSDate()},
    `Beginning transfer to satisfy deposit from {address} for date {DepositDate}`);

  var tx = await startTheTransfer(deposit);

  // Store first indication of attempted deposit
  deposit.record.hash = tx.hash;
  await inProgress.set(deposit.record);

  // All is good, finally we try to process the deposit
  var hash = await waitTheTransfer(tx);

  // If deposited & transferred, then we mark complete
  if (hash)
  {
    deposit.record.completedTimestamp = Timestamp.now();
    deposit.record.confirmed = true;
    await inProgress.set(deposit.record);
  }
  return !!hash;
}


async function initiateDeposit(deposit: Deposit)
{
  const { etransfer } = deposit
  // First, add the eTransfer tag to the email
  await setETransferLabel(etransfer.raw!, "etransfer");

  // verify we have id
  if (!etransfer.id)
  {
    log.error("Cannot process deposit from {date} without Source ID", etransfer.recieved);
    return false;
  }

  // Next, add an inProgress
  const {address} = etransfer;
  const inProgress = GetActionDoc(address, "Buy", "inProgress");
  var existing = await inProgress.get();
  if (existing.exists)
  {
    log.error("Cannot process deposits for {address} when already in progress", address);
    return false;
  }

  inProgress.set(deposit.record);
  //var success = await storeInDB(deposit.instruction.address, deposit.record);
  return inProgress;
}


async function emailNotification(deposit: Deposit)
{
  // Convert to DateTime
  await SendDepositConfirmation(deposit.etransfer.email, {
    tx: `https://ropsten.etherscan.io/tx/${deposit.record.hash}`,
    SendDate: DateTime.fromMillis(deposit.record.recievedTimestamp.toMillis()),
    ProcessDate: DateTime.fromMillis(deposit.record.processedTimestamp!.toMillis()),
    FirstName: deposit.etransfer.name
  })
}
