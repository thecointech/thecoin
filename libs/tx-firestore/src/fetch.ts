import { Dictionary } from "lodash";
import { GetUserDoc } from "@thecointech/utilities/User";
import { BaseTransactionRecord, UserAction, DepositRecord, CertifiedTransferRecord, DbRecords } from "./types";
import { fetchAllUsers } from "./users";
import { IsValidAddress } from "@thecointech/utilities";

export async function fetchDBRecords<T extends BaseTransactionRecord>(users: string[], type: UserAction) {
  const db: Dictionary<T[]> = {};
  for (const address of users.filter(IsValidAddress)) {
    const user = GetUserDoc(address);
    const allBuys = await user.collection(type).get();
    if (allBuys.docs.length > 0) {
      const dbRecords = allBuys.docs
        .map(d => d.data() as T)
        .sort((a, b) => a.recievedTimestamp.toMillis() - b.recievedTimestamp.toMillis());
      //  deepcode ignore PrototypePollutionFunctionParams: Validation occurs in IsValidAddress
      db[address] = dbRecords;
    }
  }
  return db;
}

export async function getAllFromFirestore(): Promise<DbRecords> {

  const users = await fetchAllUsers();
  const everything = {
    Buy: await fetchDBRecords<DepositRecord>(users, "Buy"),
    Sell: await fetchDBRecords<CertifiedTransferRecord>(users, "Sell"),
    Bill: await fetchDBRecords<CertifiedTransferRecord>(users, "Bill"),
  }
  return everything;
}
