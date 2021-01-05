import { Dictionary } from "lodash";
import { GetUserDoc } from "@the-coin/utilities/User";
import { BaseTransactionRecord, UserAction, DepositRecord, CertifiedTransferRecord } from "./types";
import { fetchAllUsers } from "./users";

export async function fetchDBRecords<T extends BaseTransactionRecord>(users: string[], type: UserAction) {
  const db: Dictionary<T[]> = {};
  for (const address of users) {
    const user = GetUserDoc(address);
    const allBuys = await user.collection(type).get();
    if (allBuys.docs.length > 0) {
      const dbRecords = allBuys.docs
        .map(d => d.data() as T)
        .sort((a, b) => a.recievedTimestamp.toMillis() - b.recievedTimestamp.toMillis());
      db[address] = dbRecords;
    }
  }
  return db;
}

export async function getAllFromFirestore() {

  const users = await fetchAllUsers();
  const everything = {
    buy: await fetchDBRecords<DepositRecord>(users, "Buy"),
    sell: await fetchDBRecords<CertifiedTransferRecord>(users, "Sell"),
    bill: await fetchDBRecords<CertifiedTransferRecord>(users, "Bill"),
  }
  return everything;
}
