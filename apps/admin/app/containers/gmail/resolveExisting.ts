import { DepositData, OldPurchseDB } from "./types";
import { GetUserDoc } from "@the-coin/utilities/User";
import { Dictionary } from 'lodash';

// Search through all deposits, and match with existing deposits 
export function resolveExisting(deposits: DepositData[]) {
  // Now, sort our deposits per-user
  const buckets = groupDepositsByUser(deposits);

  for (var user in buckets) {
    matchDepositsWithDb(user, buckets[user]);
  }

  return deposits;
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

async function matchDepositsWithDb(address: string, deposits: DepositData[])
{
  // First, lets get all existing purchase 
  //const action: UserAction = "Buy";
  const user = GetUserDoc(address);
  const allBuys = await user.collection("Purchase").get();

  // Now compare - can we find the matching elements?
  deposits.sort((a, b) => 
    a.record.recievedTimestamp < b.record.recievedTimestamp
      ? -1
      : 1
  )

  const sortedDocs = allBuys.docs
    .map(d => d.data() as OldPurchseDB)
    .sort((a, b) => 
      a.recieved < b.recieved
      ? -1
      : 1
    )

  for (let i = 0; i < deposits.length; i++)
  {
    const dep = deposits[i];
    // Can we find a matching buy?
    for (let j = 0; j < sortedDocs.length; j++)
    {
      if (sortedDocs[j].fiat == dep.record.fiatDisbursed &&
        sortedDocs[j].recieved.toDate().toDateString() == dep.record.recievedTimestamp.toDate().toDateString())
      {
        // its a match 
        dep.db = sortedDocs[j];
        sortedDocs.splice(j, 1);
        break;
      }
    }
  }

  const name = deposits[0].instruction.name;
  const totalTxs = deposits.length;
  const missingDb = deposits.filter(t => t.db == null).length
  const missingTx = sortedDocs.length;
  console.log(`${name} - ${address} has ${totalTxs} txs: ${missingDb} missing from DB, and ${missingTx} without deposit`);

  // Assign all remaining sortedDocs all remaining tx's
  deposits.filter(t => t.db == null)
    .forEach(t => t.db = sortedDocs);
}