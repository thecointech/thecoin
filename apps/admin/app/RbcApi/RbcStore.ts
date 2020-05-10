import { RbcTransaction } from "./types";
import PouchDB from 'pouchdb';
import { DateTime } from "luxon";

const dbName = "rbc_data";
const lastSyncKey = 'LastSync';


type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
type StoredTx = Overwrite<RbcTransaction, {TransactionDate: number}>
type StoredSyncDate = {
  time: number
}

export class RbcStore
{
  private static db: PouchDB.Database;
  private static counter: number = 0;

  static initialize(options?: PouchDB.Configuration.DatabaseConfiguration)
  {
    if (RbcStore.counter == 0)
    {
      console.log("Initializing DB");
      RbcStore.db = new PouchDB(dbName, options);
    }
    RbcStore.counter++;
  }

  static release()
  {
    RbcStore.counter = Math.max(0, RbcStore.counter - 1);
    if (0 == RbcStore.counter)
    {
      RbcStore.db?.close();
    }
  }

  static async storeTransactions(txs: RbcTransaction[], _date: Date) {
    let counter = 0;
    let daySwitcher = 0;
    for (let i = 0; i < txs.length; i++)
    {
      const tx = txs[i];
      const txTime = tx.TransactionDate.toMillis();
      if (daySwitcher != txTime) {
        daySwitcher = txTime;
        counter = 0;
      }
      
      await RbcStore.db.put<StoredTx>({
        _id: (txTime + counter++).toString(), // Add counter to enforce uniqueness on the key.
        ...tx,
        TransactionDate: txTime
      })
    }
    // Store the last synced time
    await RbcStore.db.put<StoredSyncDate>({
      _id: lastSyncKey,
      time: _date.getTime()
    });
  }
  
  static async fetchStoredTransactions(): Promise<{ txs: RbcTransaction[], syncedTill: Date}> {
    const allDocs = await RbcStore.db.allDocs<StoredTx>({include_docs: true});
    const txs = allDocs.rows
      .filter(doc => doc.id != lastSyncKey)
      .map(doc => mapStoredToTx(doc.doc!));
    const lastInsertRow = allDocs.rows.find(doc => doc.id == lastSyncKey)

    return {
      txs,
      syncedTill: new Date((lastInsertRow?.doc as any as StoredSyncDate)?.time ?? "2017-01-03")
    }
  }
}

const mapStoredToTx = (doc: StoredTx) : RbcTransaction => ({
  ...doc,
  TransactionDate: DateTime.fromMillis(doc?.TransactionDate ?? 0)
})


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
