import { init as LogInit, log } from "@the-coin/logging";
import { RbcApi, RbcStore } from "@the-coin/rbcapi";
import { ConfigStore } from "@the-coin/store";
import { init } from "@the-coin/utilities/firestore";
import { readCache, writeCache } from "./cache";
import { fetchAllRecords } from "./fetch";
import { matchAll, writeMatched } from "./match";
import rbc_secret from './rbc.secret.json';

async function initialize() {

  LogInit("fetch-transactions");
  log.debug(' --- Initializing matching  --- ');

  ConfigStore.initialize();
  RbcStore.initialize();
  RbcApi.SetCredentials(rbc_secret);
  await init();

  log.debug('Init Complete');
}

// async function fetchAllUsers() {
//   const allUsers = await GetFirestore().collection("User").get();
//   return allUsers.docs.map(user => user.id);
// }

// async function fetchDBRecords(users: string[], type: UserAction) {
//   const db: Dictionary<DocumentData[]> = {};
//   for (const address of users) {
//     const user = GetUserDoc(address);
//     const allBuys = await user.collection(type).get();
//     if (allBuys.docs.length > 0) {
//       const dbRecords = allBuys.docs
//         .map(d => d.data())
//         .sort((a, b) => a.recievedTimestamp.toMillis() - b.recievedTimestamp.toMillis());
//       db[address] = dbRecords;
//     }
//   }
//   return db;
// }

// //
// // Process deposits: Make 'em Rain!!!
// //
// async function getAllTransactions() {

//   const users = await fetchAllUsers();
//   const everything = {
//     buy: await fetchDBRecords(users, "Buy"),
//     sell: await fetchDBRecords(users, "Sell"),
//     bill: await fetchDBRecords(users, "Bill"),
//   }
//   writeFileSync('../transactions.json', JSON.stringify(everything));

//   console.log("all done");
// }

async function Process() {
  await initialize();
  const rbc = new RbcApi();
  let forceReInit = false;
  let data = forceReInit ? null: readCache();
  if (!data) {
    data = await fetchAllRecords(rbc);
    writeCache(data);
  }

  const match = matchAll(data);
  writeMatched(match);
}
Process();
