import { init as LogInit, log } from "@the-coin/logging";
import { ConfigStore } from "@the-coin/store";
import { Dictionary } from "lodash";
import { signIn } from "./firestore";
import { GetUserDoc, UserAction } from "@the-coin/utilities/User";
import { GetFirestore } from "@the-coin/utilities/firestore";
import { writeFileSync } from "fs";
import { DocumentData } from "@the-coin/types/";


async function initialize() {

  LogInit("fetch-transactions");
  log.debug(' --- Initializing transactions  --- ');

  ConfigStore.initialize();

  await signIn()

  log.debug('Init Complete');
}

async function fetchAllUsers() {
  const allUsers = await GetFirestore().collection("User").get();
  return allUsers.docs.map(user => user.id);
}

async function fetchDBRecords(users: string[], type: UserAction) {
  const db: Dictionary<DocumentData[]> = {};
  for (const address of users) {
    const user = GetUserDoc(address);
    const allBuys = await user.collection(type).get();
    if (allBuys.docs.length > 0) {
      const dbRecords = allBuys.docs
        .map(d => d.data())
        .sort((a, b) => a.recievedTimestamp.toMillis() - b.recievedTimestamp.toMillis());
      db[address] = dbRecords;
    }
  }
  return db;
}

//
// Process deposits: Make 'em Rain!!!
//
async function getAllTransactions() {

  const users = await fetchAllUsers();
  const everything = {
    buy: await fetchDBRecords(users, "Buy"),
    sell: await fetchDBRecords(users, "Sell"),
    bill: await fetchDBRecords(users, "Bill"),
  }
  writeFileSync('../transactions.json', JSON.stringify(everything));

  console.log("all done");
}

async function Process() {
  await initialize();
  await getAllTransactions();
}
Process();
