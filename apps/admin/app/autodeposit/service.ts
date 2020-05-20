import { authorize, isValid } from "./auth";
import { initializeApi, addFromGmail, setETransferLabel } from "./addFromGmail";
import { log } from '../logging';
import { RbcApi, ETransferErrorCode } from "../RbcApi";
import { NextOpenTimestamp } from "@the-coin/utilities/MarketStatus";
import { fromMillis, now } from "../utils/Firebase";
import { TransferRecord, DepositRecord } from "containers/TransferList/types";
import { RatesApi } from '@the-coin/pricing';
import { depositInBank, storeInDB } from "./process";
import { toCoin } from "@the-coin/utilities";
import { completeTheTransfer } from "./contract";
import { DepositData } from "./types";


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
  record.processedTimestamp = fromMillis(nextOpen);
  return record.processedTimestamp;
}

async function setCoinRate(record: DepositRecord)
{
  const ratesApi = new RatesApi();
  const { processedTimestamp } = record;
  // Ok, lets get an FX result for this
    const rate = await ratesApi.getConversion(124, processedTimestamp.toMillis());
    if (rate.status != 200 || !rate.data.sell)
    {
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
    const ts = now();

    log.debug({ address: address, recieved: record.recievedTimestamp.toDate() },
      `Processing deposit for {address}, recieved: {recieved} for ${record.fiatDisbursed}`);

    // First, can we process this?
    const processedTimestamp = await setSettlementDate(record);
    if (processedTimestamp >= ts) {
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
  return readyDeposits.filter(deposit => !!deposit);
}

export async function ProcessUnsettledDeposits()
{
  const deposits = await GetDepositsToProcess();
  const rbcApi = new RbcApi();

  // for each email, we immediately try and deposit it.
  for (const deposit of deposits)
  {
    // Do the actual deposit
    const result = await depositInBank(deposit, rbcApi, log.trace);
    if (result.code != ETransferErrorCode.Success && result.code != ETransferErrorCode.AlreadyDeposited)
    {
      log.error({address: deposit.instruction.address, errorCode: ETransferErrorCode[result.code]},
        `Could not process deposit from: {address}, got {errorCode}`);
      continue;
    }

    // All is good, finally we try to process the deposit
    var hash = await completeTheTransfer(deposit);

    await setETransferLabel(deposit.instruction.raw, "deposited");
    console.log(hash);
    // We must set this, regardless of whether or not the deposit completed (?)
    var success = await storeInDB(deposit.instruction.address, deposit.record);

    deposit.isComplete = success;
  }

  return deposits;
}
