import { filterCandidates, toDateTime } from "./utils";
import { AllData, BankRecord, ReconciledRecord, User } from "./types";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";

type BankFilter = ReturnType<typeof getFilter>;
// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, user: User, record: ReconciledRecord, maxDays: number) {

  const amount = record.data.fiatDisbursed * (record.action == "Buy" ? 1 : -1);
  const names = record.action == "Buy" ? user.names : undefined;
  const completed = toDateTime(record.data.completedTimestamp);
  const filter = getFilter(record.action);
  let tx = findBank(data, maxDays, amount, completed, filter, names);
  if (tx)
    data.bank.splice(data.bank.indexOf(tx), 1);
  return tx;
}

const getFilter = (action: UserAction) : (tx: BankRecord) => boolean =>
{
  switch(action) {
    case "Bill": return tx => tx.Description.startsWith('Online Banking payment');
    case "Sell": return tx => tx.Description === 'e-Transfer sent';
    case "Buy": return tx => tx.Description === 'e-Transfer received';
  }
}

export function findBank(data: AllData, maxDays: number, amount: number, date?: DateTime, filter?: BankFilter, names?: string[]) {
  // raw filter
  let candidates = data.bank.filter(tx => tx.Amount === amount);

  // Custom filter
  if (filter)
    candidates = candidates.filter(filter);

  // If names present
  if (names?.length)
    candidates = candidates.filter(tx => !tx.Details || names.includes(tx.Details));

  // Filter by date
  if (date)
    candidates = filterCandidates(candidates, "Date", date, maxDays);

  // Do we have a candidate?
  if (candidates.length == 1 || (maxDays < 2 && date && candidates.length > 0))
    return candidates[0];

  return null;
}
