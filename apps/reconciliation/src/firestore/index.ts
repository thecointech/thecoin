import { TransferRecord } from "@the-coin/tx-processing/base/types";
import { DocumentData } from "@the-coin/types/";
import { GetFirestore } from "@the-coin/utilities/firestore";
import { UserAction, GetUserDoc } from "@the-coin/utilities/User";
import { Dictionary, flatten } from "lodash";
import { TransactionRecord } from "types";

async function fetchAllUsers() {
  const allUsers = await GetFirestore().collection("User").get();
  return allUsers.docs.map(user => user.id);
}

async function fetchDBRecords(users: string[], type: UserAction) {
  const db: Dictionary<TransferRecord[]> = {};
  for (const address of users) {
    const user = GetUserDoc(address);
    const allBuys = await user.collection(type).get();
    if (allBuys.docs.length > 0) {
      const dbRecords = allBuys.docs
        .map(d => d.data() as TransferRecord)
        .sort((a, b) => a.recievedTimestamp.toMillis() - b.recievedTimestamp.toMillis());
      db[address] = dbRecords;
    }
  }
  return db;
}

//
// Process deposits: Make 'em Rain!!!
//
export async function getAllFromFirestore() {

  const users = await fetchAllUsers();
  const everything = {
    buy: await fetchDBRecords(users, "Buy"),
    sell: await fetchDBRecords(users, "Sell"),
    bill: await fetchDBRecords(users, "Bill"),
  }
  return everything;
}

const dbToRecords = (data: Dictionary<TransferRecord[]>, action: UserAction): TransactionRecord[] => {
  const r = Object.entries(data)
    .map(([address, entries]) => entries.map(
      database => ({
        action,
        address,
        database,
      })
    ))

  return flatten(r);
}


export async function fetchAllDbRecords(): Promise<TransactionRecord[]> {
  const users = await fetchAllUsers();
  const buy = await fetchDBRecords(users, "Buy");
  const sell = await fetchDBRecords(users, "Sell");
  const bill = await fetchDBRecords(users, "Bill");

  return [
    ...dbToRecords(buy, "Buy"),
    ...dbToRecords(sell, "Sell"),
    ...dbToRecords(bill, "Bill"),
  ];
}
