import { DepositData, BankRecord } from "./types";
import bank from "./banktx.json"
import { fromMillis } from "utils/Firebase";
import { compareDateTo, addNewEntries } from "./utils";

export async function addFromBank(deposits: DepositData[]) {
  let bankRecords = parseTransactions();

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

function parseTransactions() {
  return bank.transactions
    .filter(tx => tx.Description === "e-Transfer received")
    .map((tx): BankRecord => ({
      Description: tx.Description.toString(),
      Amount: tx.Amount,
      Details: tx.Details || "-- not set --",
      Date: new Date(tx.Date),
    }))
}

function getMatches(deposit: DepositData, bankRecords: BankRecord[])
{
  const forUser = bankRecords.filter(br => br.Details == deposit.instruction.name);
  const ofAmount = forUser.filter(br => br.Amount == deposit.record.fiatDisbursed);
  return ofAmount;
}

function applyBankRecord(deposit: DepositData, record: BankRecord, allRecords: BankRecord[])
{
  deposit.bank = record;
  if (!deposit.record.completedTimestamp)
    deposit.record.completedTimestamp = fromMillis(record.Date.getTime());
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
    const record = records.find(compareDateTo("Date", deposit.record.completedTimestamp));
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
    const dateRecieved = deposit.instruction.recieved;
    const dateDeposited = first.Date;
    // Delta in days
    const delta = (dateDeposited.getTime() - dateRecieved.getTime()) / (1000*60*60*24);
    const maximumAllowableDelta = 6; // 5 days
    if (delta < -1 || delta > maximumAllowableDelta) 
    {
      console.warn(`Apply bank with delta: ${delta}, of ${records.length} possibilities: ${deposit.instruction.name} on ${dateRecieved.toDateString()}`);
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
          address: clientData.instruction.address,
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
        recievedTimestamp: fromMillis(bank.Date.getTime()),
        completedTimestamp: fromMillis(bank.Date.getTime()),
        fiatDisbursed: bank.Amount,
        hash: "",
        confirmed: false
      },
      instruction,
      db: null,
      tx: null,
    }
  })
}