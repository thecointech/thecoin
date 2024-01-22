import type { BankTx } from "@thecointech/bank-interface";
import { DateTime, DateTimeOptions } from "luxon";
import { BaseStore, ConfigStore } from "@thecointech/store";

const lastSyncKey = 'LastSync';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
type StoredTx = Overwrite<BankTx, {TransactionDate: number}> & {
  incr?: number;
}

export class RbcStore extends BaseStore<StoredTx>("rbc_data")
{
  private static lastSync = new Date(0);

  public static Options: DateTimeOptions;

  static async storeTransactions(txs: BankTx[], syncDate: Date) {
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
          const upsert = (stored: Partial<StoredTx>) => {
            return isSubset(stored, doc)
              ? false
              : doc;
          };
          await this.upsert(_id, upsert);
        }
        catch (e)
        {
          console.error(e);
        }
      }
      // Store the last synced time
      await ConfigStore.set(lastSyncKey, syncDate.getTime().toString());
    }

    // We cache the lastSync time so we don't make futher fetches in this session.
    RbcStore.lastSync = syncDate;
  }

  static async fetchStoredTransactions(): Promise<{ txs: BankTx[], syncedTill: Date}> {
    const allDocs = await RbcStore.db.allDocs<StoredTx>({include_docs: true});
    const txs = allDocs.rows.map(doc => mapStoredToTx(doc.doc!));

    // Get last stored sync time, and cache it if newer
    const lastSyncTime = await ConfigStore.get(lastSyncKey);
    const lastSync = lastSyncTime
      ? new Date(parseInt(lastSyncTime))
      : new Date("2017-01-03");

    if (lastSync > RbcStore.lastSync)
      RbcStore.lastSync = lastSync;

    return {
      txs,
      syncedTill: RbcStore.lastSync
    }
  }
}

const mapStoredToTx = (doc: StoredTx) : BankTx => ({
  ...doc,
  TransactionDate: DateTime.fromMillis(doc?.TransactionDate ?? 0, RbcStore.Options)
})

const isSubset = (superObj: Partial<StoredTx>, subObj: Partial<StoredTx>) => {
  return Object.keys(subObj).every(ele => {
    const k = ele as keyof StoredTx;
    return subObj[k] === superObj[k]
  });
};
