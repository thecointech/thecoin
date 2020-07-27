import { DepositData } from "./types";
import { IsValidAddress } from "@the-coin/utilities";
import { GetUserDoc } from "@the-coin/utilities/User";
import { Dictionary } from 'lodash';
import { addNewEntries } from "./process";
import { PurchaseType, DepositRecord } from "autoaction/types";

// Search through all deposits, and match with existing deposits
export async function addFromDB(deposits: DepositData[]) {
  const originalLength = deposits.length;
  console.log(` -- Matching DB for ${originalLength} deposits -- `);
  // Now, sort our deposits per-user
  const buckets = groupDepositsByUser(deposits);
  const allDBRecords = await fetchDBRecords(buckets);
  for (var user in buckets) {
    await matchDepositsWithDb(user, buckets[user], allDBRecords);
  }

  const numUnmatched = deposits.filter(d => !d.db).length;
  console.log(`There are ${numUnmatched} records with no matching DB record`);
  const newEntries = buildUnmatchedDBEntries(deposits, allDBRecords);
  console.log(`Added ${newEntries.length} new entries from database`);
  return addNewEntries(deposits, newEntries);
}

function groupDepositsByUser(deposits: DepositData[]) {
  const bucketed: Dictionary<DepositData[]> = {};
  for (let i = 0; i < deposits.length; i++) {
    const dep = deposits[i];
    const { address} = dep.instruction;
    if (!address)
      continue;
    if (!bucketed[address])
      bucketed[address] = [dep]
    else
      bucketed[address].push(dep);
  }
  return bucketed;
}

async function fetchDBRecords(deposits: Dictionary<DepositData[]>) {
  const db: Dictionary<DepositRecord[]> = {};
  for (const address in deposits) {
    const user = GetUserDoc(address);
    const allBuys = await user.collection("Buy").get();
    const dbRecords = allBuys.docs
      .map(d => d.data() as DepositRecord)
      .sort((a, b) =>
        a.recievedTimestamp < b.recievedTimestamp
          ? -1
          : 1
      )
    db[address] = dbRecords;
  }
  return db;
}

async function matchDepositsWithDb(address: string, deposits: DepositData[], db: Dictionary<DepositRecord[]>) {
  if (!IsValidAddress(address))
    return;

  const docs = db[address];
  if (!docs)
    return;

  // First, exact matches
  deposits.forEach(deposit => findExactMatch(deposit, docs))
  // Next, fuzzy matches
  deposits.forEach(deposit => findMatchByAmount(deposit, deposits, docs))

  reportStats(deposits, docs);

  // Assign all remaining sortedDocs all remaining tx's
  if (docs.length > 0) {
    deposits.filter(t => t.db == null && t.instruction.address == address)
      .forEach(t => t.db = docs.filter(record => record.fiatDisbursed == t.record.fiatDisbursed))
  }
}

//
// Find match based on amount and time recieved
function findExactMatch(deposit: DepositData, db: DepositRecord[])
{
  // Search through DB records for something that matches this deposit
  const records = db
    .filter(record => record.fiatDisbursed == deposit.record.fiatDisbursed)
    .filter(record => record.recievedTimestamp.toDate().toDateString() == deposit.record.recievedTimestamp?.toDate().toDateString())

  if (records.length == 1)
    assignDB(deposit, db, records[0]);
}

//
// Fuzzier match - if there is a single deposit that matches, we take that.
function findMatchByAmount(deposit: DepositData, deposits: DepositData[], db: DepositRecord[])
{
  // If we are matching by amount, we can only match desposits that only
  // have a single desposit of the given amout
  var canBeMatched = deposits.filter(d => d.record.fiatDisbursed == deposit.record.fiatDisbursed).length == 1;
  if (!canBeMatched)
    return;

  // Search through DB records for something that matches this deposit
  const records = db
    .filter(record => record.fiatDisbursed == deposit.record.fiatDisbursed)
  if (records.length == 1)
    assignDB(deposit, db, records[0]);
}

function reportStats(deposits: DepositData[], db: DepositRecord[])
{
  const { name, address }  = deposits[0].instruction;
  const totalTxs = deposits.length;
  const missingDb = deposits.filter(t => t.db == null).length
  const missingTx = db.length;
  if (missingDb != 0 || missingTx != 0) {
    console.log(`${name} - ${address} has ${totalTxs} txs: ${missingDb} missing from DB, and ${missingTx} without deposit`);
  }
}

//
//
function assignDB(deposit: DepositData, db: DepositRecord[], record: DepositRecord) {
  assign(deposit, record);
  db.splice(db.indexOf(record), 1);
}

function assign(deposit: DepositData, db: DepositRecord) {
  //const oldMix: OldPurchseDB & DepositRecord = old as any;
  deposit.db = db;
  // Remove from list
  // Copy relevant data over
  deposit.record = {
    ...db
  };
  // deposit.record.hash = db.hash;
  // deposit.record.recievedTimestamp = db.recievedTimestamp,
  //   deposit.record.processedTimestamp = db.processedTimestamp,
  //   deposit.record.completedTimestamp = db.completedTimestamp,
  //   deposit.record.confirmed = db.confirmed,
  //   deposit.record.fiatDisbursed = db.fiatDisbursed,
  //   deposit.record.transfer = { value: db.coin }
}

function buildUnmatchedDBEntries(deposits: DepositData[], db: Dictionary<DepositRecord[]>) {

  let unmatched :DepositData[] = [];
  for (const address in db) {
    const docs = db[address];
    if (docs.length === 0)
      continue;

    // I think this is purely for Juliana's wages
    // Here we find all addresses that do not have any existing tx's missing db's
    // but that also have downloaded entries that have not been assigned
    const depositsMissingDb = deposits.filter(d => d.db === null && d.instruction.address === address).length;
    if (depositsMissingDb == 0) {
      const inst = deposits.find(d => d.instruction.address === address);
      const newEntries = docs.map((d): DepositData => {
        var deposit: DepositData = {
          instruction: {
            name: inst?.instruction.name ?? "ERROR: Name Missing",
            address,
            email: inst?.instruction.email ?? "ERROR: Email Missing",
          },
          record: {
            type: PurchaseType.other,
          } as any,
          tx: null,
          db: null,
          bank: null,
        }
        assign(deposit as DepositData, d);
        return deposit;
      })
      unmatched = [...newEntries, ...unmatched]
    }
  }
  return unmatched;
}
