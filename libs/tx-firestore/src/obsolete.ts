import { Timestamp } from "@the-coin/types";
import { IsValidAddress } from "@the-coin/utilities";
import { GetUserDoc } from "@the-coin/utilities/User";
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
type ObsoleteRecord = DepositRecord|Obsolete;
export type ObsoleteRecords = Dictionary<ObsoleteRecord[]>;
export async function getAllFromFirestoreObsolete() : Promise<ObsoleteRecords>{

  const users = await fetchAllUsers();
  const everything = await fetchDBRecords(users, "Purchase" as any);
  return everything;
}

export async function fetchDBRecords(users: string[], type: string) {
  const db: Dictionary<ObsoleteRecord[]> = {};
  for (const address of users) {
    // deepcode suggestion: avoid prototype pollution
    if (!IsValidAddress(address))
      continue;
    const user = GetUserDoc(address);
    const allBuys = await user.collection(type).get();
    if (allBuys.docs.length > 0) {
      const dbRecords = allBuys.docs
        .map(d => d.data() as ObsoleteRecord);
      db[address] = dbRecords;
    }
  }
  return db;
}
