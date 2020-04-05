import { Timestamp } from "@the-coin/types/FirebaseFirestore";
import { DepositData } from "./types";


export function addNewEntries(deposits: DepositData[], moreDeposits: DepositData[])
{
  return [...deposits, ...moreDeposits]
    .sort((a, b) => a.record.recievedTimestamp.seconds - b.record.recievedTimestamp.seconds);
}

export function compareDateTo<K>(key: keyof K, ts: Timestamp) {
  return (k: K) => (k[key] as any).toDateString() == ts.toDate().toDateString();
}
