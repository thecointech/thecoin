import { RbcTransaction } from "./types";
import PouchDB from 'pouchdb';
import upsert from 'pouchdb-upsert';
import { DateTime, DateTimeOptions } from "luxon";

PouchDB.plugin(upsert);

const dbName = "rbc_data";
const lastSyncKey = 'LastSync';


type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
type StoredTx = Overwrite<RbcTransaction, {TransactionDate: number}> & {
  incr?: number;
}

type StoredSyncDate = {
  time: number
}

export class RbcStore
{
  private static db: PouchDB.Database;
  private static counter: number = 0;
  private static lastSync = new Date(0);

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

  static async storeTransactions(txs: RbcTransaction[], syncDate: Date) {
    let counter = 0;
    let daySwitcher = 0;
    // We only store if we have actual data
    // this to avoid potentiall storing a lastSyncTime
    // where we didn't get any values (error or any other reason)
    if (txs.length > 0)
    {
      for (let i = 0; i < txs.length; i++)
      {
        const tx = txs[i];
        const txTime = tx.TransactionDate.toMillis();
        if (daySwitcher != txTime) {
          daySwitcher = txTime;
          counter = 0;
        }
        
        try {
          // The ID is intended to be unique and re-creatable per-document
          const _id = (txTime + counter++).toString();
          const doc = {
            ...tx,
            TransactionDate: txTime
          };
          const upsert = (stored: StoredTx) => {
            return isSubset(stored, doc)
              ? false
              : doc;
          };
          await RbcStore.db.upsert<StoredTx>(_id, upsert);
        }
        catch (e)
        {
          console.error(e);
        }
      }
      // Store the last synced time
      await RbcStore.db.upsert<StoredSyncDate>(lastSyncKey, (_doc) => ({
        time: syncDate.getTime()
      }));
    }

    // We cache the lastSync time so we don't make futher fetches in this session.
    RbcStore.lastSync = syncDate;
  }
  
  static async fetchStoredTransactions(timezoneOptions?: DateTimeOptions): Promise<{ txs: RbcTransaction[], syncedTill: Date}> {
    const allDocs = await RbcStore.db.allDocs<StoredTx>({include_docs: true});
    const txs = allDocs.rows
      .filter(doc => doc.id != lastSyncKey)
      .map(doc => mapStoredToTx(doc.doc!, timezoneOptions));

    // Get last stored sync time, and cache it if newer
    const lastSyncRow = allDocs.rows.find(doc => doc.id == lastSyncKey)
    const lastSync = new Date((lastSyncRow?.doc as any as StoredSyncDate)?.time ?? "2017-01-03");
    if (lastSync > RbcStore.lastSync)
      RbcStore.lastSync = lastSync;

    return {
      txs,
      syncedTill: RbcStore.lastSync
    }
  }
}

const mapStoredToTx = (doc: StoredTx, timezoneOptions?: DateTimeOptions) : RbcTransaction => ({
  ...doc,
  TransactionDate: DateTime.fromMillis(doc?.TransactionDate ?? 0, timezoneOptions)
})

const isSubset = (superObj: StoredTx, subObj: StoredTx) => {
  return Object.keys(subObj).every(ele => {
      return subObj[ele] === superObj[ele]
  });
};
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
