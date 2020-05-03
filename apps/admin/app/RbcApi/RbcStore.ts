import Dexie from 'dexie';
import { RbcTransaction } from "./types";

const dbName = "the_data";

type StoredTransaction = {
  id?: number,
} & RbcTransaction;

export class AdminDB extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  txs: Dexie.Table<StoredTransaction, number>; // number = type of the primkey
  //...other tables goes here...

  constructor () {
      super(dbName);
      this.version(1).stores({
        txs: '++id, AccountType, AccountNumber, TransactionDate, ChequeNumber, Description1, Description2, CAD, USD',
          //...other tables goes here...
      });
      // The following line is needed if your typescript
      // is compiled using babel instead of tsc:
      this.txs = this.table("txs");
  }
}

const db = new AdminDB();


export async function storeTransactions(txs: RbcTransaction[])
{
  await db.transaction('rw', db.txs, async function () {
    txs.forEach(tx => {
      db.txs.add(tx);
    })
  });
}

export async function fetchStoredTransactions() {
  let txs = await db.txs.toArray();
  return txs;
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
