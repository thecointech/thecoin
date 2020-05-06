import { RbcTransaction } from "./types";

//const dbName = "rbc_data";
//const lastTxFetchKey = 'LastTxFetch';

export async function storeTransactions(_txs: RbcTransaction[], _date: Date)
{
  // await db.transaction('rw', db.txs, async function () {
  //   txs.forEach(tx => {
  //     db.txs.add(tx);
  //   })
  // });
}

export async function fetchStoredTransactions() : Promise<RbcTransaction[]> {
  // let txs = await db.txs.toArray();
  // return txs;
  return [];
}



export function getLastInsertDate() {
  // This project started in 2016 (?)
  const lastUpdate = null; //localStorage.getItem(LastTxFetchKey);
  return lastUpdate ? new Date(lastUpdate) : new Date(2016);
}



// var db = indexedDB.open(dbName);


// export function StoreNewTransactions(txs: RbcTransaction[]) {
//   var request = db.transaction([txTable], "readwrite")
//   .objectStore("employee")
//   .add({ id: "01", name: "prasad", age: 24, email: "prasad@tutorialspoint.com" });

//   request.onsuccess = function(event) {
//      alert("Prasad has been added to your database.");
//   };

//   request.onerror = function(event) {
//      alert("Unable to add data\r\nPrasad is already exist in your database! ");
//   }
// }

// function addTables(e: any) {
//   const db = e.target.result;
//   db.createObjectStore(txTable, {autoIncrement: true});
// }


//   db.onerror = (event) => {
//     console.error("Something went wrong!");
//     // Handle errors.
//   };
//   db.onupgradeneeded = (event) => {
//     var db = event.target.result;

//     // Create an objectStore to hold information about our customers. We're
//     // going to use "ssn" as our key path because it's guaranteed to be
//     // unique - or at least that's what I was told during the kickoff meeting.
//     var objectStore = db.createObjectStore("customers", { keyPath: "ssn" });
//     // Create another object store called "names" with the autoIncrement flag set as true.
//     var objStore = db.createObjectStore("names", { autoIncrement : true });
//     // Create an index to search customers by name. We may have duplicates
//     // so we can't use a unique index.
//     objectStore.createIndex("name", "name", { unique: false });

//     // Create an index to search customers by email. We want to ensure that
//     // no two customers have the same email, so use a unique index.
//     objectStore.createIndex("email", "email", { unique: true });

//     // Use transaction oncomplete to make sure the objectStore creation is
//     // finished before adding data into it.
//     objectStore.transaction.oncomplete = function(event) {
//       // Store values in the newly created objectStore.
//       var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
//       customerData.forEach(function(customer) {
//         customerObjectStore.add(customer);
//       });
//     };
//   };
// }
