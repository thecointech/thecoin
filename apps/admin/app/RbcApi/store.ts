import { RbcTransaction } from "./types";
import PouchDB from 'pouchdb';
import upsert from 'pouchdb-upsert';
import { DateTime } from "luxon";
import credentials from './credentials.json';

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
      RbcStore.db = new PouchDB(dbName, {
        revs_limit: 1,
        auto_compaction: true,
        ...options
      });
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
    // this to avoid potentially storing a lastSyncTime
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
  
  static async fetchStoredTransactions(): Promise<{ txs: RbcTransaction[], syncedTill: Date}> {
    const allDocs = await RbcStore.db.allDocs<StoredTx>({include_docs: true});
    const txs = allDocs.rows
      .filter(doc => doc.id != lastSyncKey)
      .map(doc => mapStoredToTx(doc.doc!));

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

const mapStoredToTx = (doc: StoredTx) : RbcTransaction => ({
  ...doc,
  TransactionDate: DateTime.fromMillis(doc?.TransactionDate ?? 0, credentials.TimeZone)
})

const isSubset = (superObj: StoredTx, subObj: StoredTx) => {
  return Object.keys(subObj).every(ele => {
      return subObj[ele] === superObj[ele]
  });
};