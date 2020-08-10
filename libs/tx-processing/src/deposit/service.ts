import { authorize, isValid } from "./auth";
import { initializeApi, addFromGmail, setETransferLabel } from "./addFromGmail";
import { log } from '@the-coin/logging';
import { RbcApi, ETransferErrorCode } from "@the-coin/rbcapi";
import { NextOpenTimestamp } from "@the-coin/utilities/MarketStatus";
import { TransferRecord, DepositRecord } from "../base/types";
import { RatesApi } from '@the-coin/pricing';
import { depositInBank, storeInDB } from "./process";
import { toCoin, isPresent } from "@the-coin/utilities";
import { waitTheTransfer, startTheTransfer } from "./contract";
import { DepositData } from "./types";
import { Timestamp } from "@the-coin/utilities/firestore";


export async function FetchDepositEmails()
{
  log.trace(`fetching from gmail`);
  // First, connect and fetch new deposit emails.
  const auth = await authorize();
  if (!isValid(auth))
    throw new Error("Cannot run service without auth.  Please login from the UI first");

  await initializeApi(auth);

  // fetch new deposits
  const emails = await addFromGmail('redirect interac -remember -expired -label:etransfer-deposited -label:etransfer-rejected');
  log.debug(`fetching emails: got ${emails.length} results`);
  return emails;
}

export async function setSettlementDate(record: TransferRecord) {
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

async function FillDepositDetails(deposit: DepositData) {
  // get users address
  const { instruction, record } = deposit;
  const { address } = instruction;

  try {
    const ts = Timestamp.now();

    log.debug({ address: address, recieved: record.recievedTimestamp.toDate() },
      `Processing deposit for {address}, recieved: {recieved} for ${record.fiatDisbursed}`);

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
  return deposit;
}

export async function GetDepositsToProcess()
{
  const rawDeposits = await FetchDepositEmails();
  // Fill in appropriate details for pending deposits
  const readyDepositsAsync = rawDeposits.map(FillDepositDetails);
  // complete async
  const readyDeposits = await Promise.all(readyDepositsAsync);
  // Remove all deposits that weren't properly filled out
  return readyDeposits.filter(isPresent);
}

export async function ProcessUnsettledDeposits()
{
  const deposits = await GetDepositsToProcess();
  const rbcApi = new RbcApi();

  // for each email, we immediately try and deposit it.
  for (const deposit of deposits)
  {
    deposit.isComplete = await ProcessUnsettledDeposit(deposit, rbcApi);
  }

  return deposits;
}

export async function ProcessUnsettledDeposit(deposit: DepositData, rbcApi: RbcApi)
{
  //await initiateDeposit(deposit);

  let success = true;

  // Do the actual deposit
  if (!await ProcessDepositBank(deposit, rbcApi))
    return false;

  // Complete transfer to person
  const processed = ProcessDepositTransfer(deposit);
  success = processed && success;

  // Mark email as complete
  if (deposit.instruction.raw)
    await setETransferLabel(deposit.instruction.raw, "deposited");

  // We must set this, regardless of whether or not the deposit completed (?)
  const stored = await storeInDB(deposit.instruction.address, deposit.record);
  return success && stored;
}

//
// Put money in the bank.  Should only return true
// if this transfer was actually completed
export async function ProcessDepositBank(deposit: DepositData, rbcApi: RbcApi)
{
  const result = await depositInBank(deposit, rbcApi, log.trace);
  if (result.code != ETransferErrorCode.Success)
  {
    log.error({address: deposit.instruction.address, errorCode: ETransferErrorCode[result?.code ?? ETransferErrorCode.UnknownError]},
      `Could not process deposit from: {address}, got {errorCode}`);
    return false;
  }
  return true;
}

//
// Transfer the appropriate amount of Coin to client
export async function ProcessDepositTransfer(deposit: DepositData)
{
  log.debug({address: deposit.instruction.address, deposited: deposit.instruction.recieved},
    `Beginning transfer to satisfy deposit from {address} for date {DepositDate}`);

  var tx = await startTheTransfer(deposit);
  // Store first indication of attempted deposit
  deposit.record.hash = tx.hash;
  var success = await storeInDB(deposit.instruction.address, deposit.record);

  if (!success)
  {
    log.error({address: deposit.instruction.address, hash: tx.hash},
      `Initial store failed for deposit from: {address} with hash {hash}`);
  }
  // All is good, finally we try to process the deposit
  var hash = await waitTheTransfer(tx);

  // If deposited & transferred, then we mark complete
  if (hash)
  {
    deposit.record.completedTimestamp = Timestamp.now();
    deposit.record.confirmed = true;
  }
}


// async function initiateDeposit(deposit: DepositData)
// {
//   var success = await storeInDB(deposit.instruction.address, deposit.record);
//   return success;
// }
