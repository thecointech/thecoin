import { DepositData, OldPurchseDB } from "./types";
import { IsValidAddress } from "@the-coin/utilities";
import { GetUserDoc } from "@the-coin/utilities/User";
import { Dictionary } from 'lodash';
import { addNewEntries } from "./utils";

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

  const numMatched = deposits.filter(d => !d.db).length;
  console.log(`Matched ${numMatched} records`);
  const newEntries = buildUnmatchedDBEntries(deposits, allDBRecords);
  console.log(`Added ${newEntries.length} new entries from database`);
  return addNewEntries(deposits, newEntries);
}

function groupDepositsByUser(deposits: DepositData[])
{
  const bucketed: Dictionary<DepositData[]> = {};
  for (let i = 0; i < deposits.length; i++) {
    const dep = deposits[i];
    if (!bucketed[dep.instruction.address])
      bucketed[dep.instruction.address] = [dep]
    else
      bucketed[dep.instruction.address].push(dep);
  }
  return bucketed;
}

async function fetchDBRecords(deposits: Dictionary<DepositData[]>)
{
  const db: Dictionary<OldPurchseDB[]> = {};
  for (const address in deposits) {
    const user = GetUserDoc(address);
    const allBuys = await user.collection("Purchase").get();
    const oldDB = allBuys.docs
      .map(d => d.data() as OldPurchseDB)
      .sort((a, b) => 
        a.recieved < b.recieved
        ? -1
        : 1
      )
    db[address] = oldDB;
  }
  return db;
}

async function matchDepositsWithDb(address: string, deposits: DepositData[], db: Dictionary<OldPurchseDB[]>)
{
  if (!IsValidAddress(address))
    return;

  const docs = db[address];
  for (let i = 0; i < deposits.length; i++)
  {
    const dep = deposits[i];
    // Can we find a matching buy?
    for (let j = 0; j < docs.length; j++)
    {
      if (docs[j].fiat == dep.record.fiatDisbursed &&
        docs[j].settled.toDate().toDateString() == dep.record.processedTimestamp?.toDate().toDateString())
      {
        // its a match 
        assignDb(docs, dep, j);
        break;
      }
    }
  }

  // if we have only 1 tx of each size that matches, then we match those up
  for (let i = 0; i < deposits.length; i++)
  {
    const dep = deposits[i];
    const numDeps = deposits.filter(d => d.db == null && d.record.fiatDisbursed == dep.record.fiatDisbursed);
    const numOlds = docs.filter(o => o.fiat == dep.record.fiatDisbursed);
    if (numDeps.length == 1 && numOlds.length == 1) {
      const oldIndex = docs.findIndex(o => o.fiat == dep.record.fiatDisbursed);
      assignDb(docs, dep, oldIndex);
    }
  }

  const name = deposits[0].instruction.name;
  const totalTxs = deposits.length;
  const missingDb = deposits.filter(t => t.db == null).length
  const missingTx = docs.length;
  if (missingDb != 0 || missingTx != 0) {
    console.log(`${name} - ${address} has ${totalTxs} txs: ${missingDb} missing from DB, and ${missingTx} without deposit`);
  }

  // Assign all remaining sortedDocs all remaining tx's
  if (docs.length > 0) {
    deposits.filter(t => t.db == null)
    .forEach(t => t.db = docs)
  }
}

function assignDb(docs: OldPurchseDB[], deposit: DepositData, index: number)
{
  const old = docs[index];
  deposit.db = old;
  // Remove from list
  // Copy relevant data over
  deposit.record.hash = old.txHash;
  deposit.record.recievedTimestamp = old.recieved,
  deposit.record.processedTimestamp = old.settled,
  deposit.record.completedTimestamp = old.completed,
  deposit.record.confirmed = !!old.completed,
  deposit.record.fiatDisbursed = old.fiat,
  deposit.record.transfer = {value: old.coin }
  docs.splice(index, 1);
}

function buildUnmatchedDBEntries(deposits: DepositData[], db: Dictionary<OldPurchseDB[]>)
{
  for (const address in db)
  {
    const docs = db[address];
    if (docs.length === 0)
      continue;

    // I think this is purely for Juliana's wages
    const depositsMissingDb = deposits.filter(d => d.db === null && d.instruction.address === address).length;
    if (depositsMissingDb == 0)
    {
      const inst = deposits.find(d => d.instruction.address === address);
      return docs.map((d): DepositData => ({
        instruction: {
          name: inst.instruction.name,
          address,
          email: inst.instruction.email,
        },
        record: {
          hash: d.txHash,
          recievedTimestamp: d.recieved,
          processedTimestamp: d.settled,
          completedTimestamp: d.completed,
          confirmed: !!d.completed,
          fiatDisbursed: d.fiat,
          transfer: {value: d.coin },
          type: 'other',
        },
        db: d,
        tx: null,
        bank: null,
      }))
    }
  }
  return [];
}