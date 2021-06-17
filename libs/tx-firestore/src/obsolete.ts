import { Timestamp } from "@thecointech/types";
import { IsValidAddress } from "@thecointech/utilities";
import { GetUserDoc } from "@thecointech/utilities/User";
import { Dictionary } from "lodash";
import { DepositRecord } from "./types";
import { fetchAllUsers } from "./users";

export type Obsolete = {
  coin: number,
  completed: Timestamp,
  emailHash: string,
  fiat: number,
  recieved: Timestamp,
  settled: Timestamp,
  txHash: string
}
type ObsoleteRecord = DepositRecord | Obsolete;
export type ObsoleteRecords = Dictionary<ObsoleteRecord[]>;
export async function getAllFromFirestoreObsolete(): Promise<ObsoleteRecords> {

  const users = await fetchAllUsers();
  const everything = await fetchDBRecords(users, "Purchase");
  return everything;
}

export async function fetchDBRecords(users: string[], type: string) {
  const db: Dictionary<ObsoleteRecord[]> = {};
  // deepcode suggestion: avoid prototype pollution
  for (const address of users.filter(IsValidAddress)) {
    const user = GetUserDoc(address);
    const allBuys = await user.collection(type).get();
    if (allBuys.docs.length > 0) {
      const dbRecords = allBuys.docs
        .map(d => d.data() as ObsoleteRecord);
      //  deepcode ignore PrototypePollutionFunctionParams: Validation occurs in IsValidAddress
      db[address] = dbRecords;
    }
  }
  return db;
}