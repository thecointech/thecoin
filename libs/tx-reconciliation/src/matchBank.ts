import { filterCandidates, toDateTime } from "./utils";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";

type BankFilter = ReturnType<typeof getFilter>;
// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, user: User, record: ReconciledRecord, maxDays: number) {

  const r = record.bank;
  if (r.length % 2 != 1) {

    // Find TX
    const amount = record.data.fiatDisbursed * (record.action == "Buy" ? 1 : -1);
    const names = record.action == "Buy" ? user.names : undefined;
    // Find most recent completion attempt
    const completed = record.bank.slice(-1)[0]?.Date ?? toDateTime(record.data.completedTimestamp);
    const filter = getFilter(record.action);
    let tx = findBank(data, maxDays, amount, completed, filter, names);
    if (tx) {
      data.bank.splice(data.bank.indexOf(tx), 1);
      r.push(tx);

      // was this cancelled?
      const confirmation = (record.data as any).confirmation;
      const cancelled = findCancellation(data, amount, completed, confirmation);
      if (cancelled) {
        data.bank.splice(data.bank.indexOf(cancelled), 1);
        r.push(cancelled);
      }
    }
  }
  return r;
}

export const getFilter = (action: UserAction) : (tx: BankRecord) => boolean =>
{
  switch(action) {
    case "Bill": return tx => tx.Description.startsWith('Online Banking payment');
    case "Sell": return tx => tx.Description === 'e-Transfer sent';
    case "Buy": return tx => tx.Description === 'e-Transfer received' || tx.Description === 'e-Transfer - Request Money';
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

export function findCancellation(data: AllData, amount: number, date: DateTime, id?: string) {

  let candidates = data.bank
    .filter(b => b.Amount == -amount)
    .filter(b => b.Description.startsWith('INTERAC e-Transfer cancel'))

  // early-exit optimization
  if (candidates.length == 0)
    return undefined;

  // get ids of cancelled transfers
  const index = candidates
    .map(c => c.Description.match(/\d+$/))
    .findIndex(m => m && m[0] == id);
  if (index >= 0)
    return candidates[index];

  // match by date
  candidates = filterCandidates(candidates, "Date", date.minus({days: 15}), 30);
  if (candidates.length == 1)
    return candidates[0];
  else if (candidates.length > 1) {
    console.error('Better specificity required');
  }
  return undefined;
}
