import { DepositData } from "./types";


export function addNewEntries(deposits: DepositData[], moreDeposits: DepositData[])
{
  return [...deposits, ...moreDeposits]
    .sort((a, b) => a.record.recievedTimestamp.seconds - b.record.recievedTimestamp.seconds);
}
