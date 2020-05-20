import { DepositData, BankRecord } from "./types";
import { fromMillis } from "utils/Firebase";
import { addNewEntries } from "./process";
import { PurchaseType } from "containers/TransferList/types";
import { RbcApi } from "RbcApi";
import { Timestamp } from "@the-coin/types/FirebaseFirestore";
import { DateTime } from "luxon";

export async function addFromBank(deposits: DepositData[], bankApi: RbcApi) {
  let bankRecords = await parseTransactions(bankApi);

  for (const deposit of deposits) {
    // Find a matching deposit?
    if (deposit.record.completedTimestamp) {
      matchFromTimestamp(deposit, bankRecords);
    }
  }
  for (const deposit of deposits) {
    if (!deposit.bank) {
      matchFromGuess(deposit, bankRecords);
    }
  }

  const newDeposits = buildDeposits(bankRecords, deposits);
  console.log(`Adding ${newDeposits.length} new deposits from bank records`);
  return addNewEntries(deposits, newDeposits);
}

async function parseTransactions(bankApi: RbcApi) {
  const txs = await bankApi.fetchLatestTransactions();
  return txs
    .filter(tx => tx.Description1 === "e-Transfer received")
    .map((tx): BankRecord => ({
      Description: tx.Description1,
      Amount: tx.CAD,
      Details: tx.Description2 || "-- not set --",
      Date: tx.TransactionDate,
    }))
}

function getMatches(deposit: DepositData, bankRecords: BankRecord[])
{
  const forUser = bankRecords.filter(br => br.Details == deposit.instruction.name);
  const ofAmount = forUser.filter(br => br.Amount == deposit.record.fiatDisbursed);
  return ofAmount;
}

export function compareDateTo(ts: Timestamp) {
  const ds = DateTime.fromMillis(ts.toMillis(), RbcApi.ApiTimeZone);
  return (k: BankRecord) => k.Date.hasSame(ds, "day");
}


function applyBankRecord(deposit: DepositData, record: BankRecord, allRecords: BankRecord[])
{
  deposit.bank = record;
  if (!deposit.record.completedTimestamp) {
    deposit.record.completedTimestamp = fromMillis(record.Date.toMillis());
  }
  if (deposit.record.type === PurchaseType.other) {
    deposit.record.type = PurchaseType.deposit;
  }
  allRecords.splice(allRecords.indexOf(record), 1);
}

function matchFromTimestamp(deposit: DepositData, bankRecords: BankRecord[]) {
  const records = getMatches(deposit, bankRecords);
  if (records.length == 1)
  {
    // This must be it, apply it
    applyBankRecord(deposit, records[0], bankRecords);
  }
  else {
    // Find the record on the same day as this one
    const record = records.find(compareDateTo(deposit.record.completedTimestamp));
    if (record)
    {
      applyBankRecord(deposit, record, bankRecords);
    }
    else {
      // Skip matching Juliana's deposits
      if (deposit.instruction.address !== "0xd86c97292b9be3a91bd8279f114752248b80e8c5") {
        console.error("Could not find bank record for date: " + deposit.record.recievedTimestamp.toDate().toDateString());
      }
    }
  }
}

function matchFromGuess(deposit: DepositData, bankRecords: BankRecord[]) {
  const records = getMatches(deposit, bankRecords);
  if (records.length > 0) {
    // Else, we can we assume it's the first one?
    const first = records[0];
    // Did this record happen reasonable soon after we recieved the email?
    const dateRecieved = deposit.record.recievedTimestamp;
    const dateDeposited = first.Date;
    // Delta in days
    const delta = (dateDeposited.toMillis() - dateRecieved.toMillis()) / (1000*60*60*24);
    const maximumAllowableDelta = 30;
    if (delta < -1 || delta > maximumAllowableDelta)
    {
      console.warn(`Cannout apply bank with delta: ${delta}, of ${records.length} possibilities: ${deposit.instruction.name} on ${dateRecieved.toDate().toDateString()}`);
      return;
    }
    applyBankRecord(deposit, first, bankRecords);
  }
}

function buildDeposits(bankRecords: BankRecord[], existing: DepositData[]) {
  return bankRecords.map((bank): DepositData => {
    const clientData = existing.find(d => d.instruction.name == bank.Details)
    const instruction = {
      name: bank.Details,
      depositUrl: "",
      subject: "",
      body: "",
      ...clientData
      ? {
          // we cannot be certain that the matched address is/was the one being deposited to
          // (ie, a client may have multiple accounts, and we can't tell which one was intended here)
          //address: clientData.instruction.address,
          email: clientData.instruction.email,
        }
      : {
          address: "",
          email: "",
        }
    };
    return {
      bank,
      record: {
        transfer: {
          value: -1
        },
        recievedTimestamp: fromMillis(bank.Date.toMillis()),
        completedTimestamp: fromMillis(bank.Date.toMillis()),
        fiatDisbursed: bank.Amount,
        hash: "",
        confirmed: false,
        type: PurchaseType.deposit,
      },
      instruction,
      db: null,
      tx: null,
    }
  })
}
