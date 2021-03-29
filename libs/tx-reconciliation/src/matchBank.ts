import { filterCandidates, toDateTime } from "./utils";
import { UserAction } from "@thecointech/utilities/User";
import { DateTime } from "luxon";
import { AllData, User, ReconciledRecord, BankRecord } from "types";

type BankFilter = ReturnType<typeof getFilter>;
// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, user: User, record: ReconciledRecord, maxDays: number) {

  const r = record.bank;
  if (r.length % 2 !== 1) {

    // Find TX
    const amount = record.data.fiatDisbursed * (record.action === "Buy" ? 1 : -1);
    const names = record.action === "Buy" ? user.names : undefined;
    // Find most recent completion attempt
    const completed = getCompleted(record)
    const filter = getFilter(record.action);
    const tx = findBank(data, maxDays, amount, completed, filter, names);
    if (tx) {
      data.bank.splice(data.bank.indexOf(tx), 1);
      r.push(tx);

      // was this cancelled?
      const confirmation = record.data.confirmation;
      if (completed) {
        const cancelled = findCancellation(data, amount, completed, confirmation?.toString());
        if (cancelled) {
          data.bank.splice(data.bank.indexOf(cancelled), 1);
          r.push(cancelled);
        }
      }
    }
  }
  return r;
}

// Compiler error: somehow TS loses the possibility that this date might be undefined
const getCompleted = (record: ReconciledRecord) : DateTime|undefined =>
  record.bank.slice(-1)[0]?.Date ?? toDateTime(record.data.completedTimestamp) ?? toDateTime(record.data.processedTimestamp);

export const getFilter = (action: UserAction) : (tx: BankRecord) => boolean =>

{
  switch(action) {
    case "Bill": return tx => tx.Description.startsWith('Online Banking payment');
    case "Sell": return tx => tx.Description === 'e-Transfer sent';
    case "Buy": return tx => tx.Description === 'e-Transfer received' || tx.Description === 'e-Transfer - Request Money';
    default:
      throw new Error("Unknown action type");
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
  if (candidates.length === 1 || (maxDays < 2 && date && candidates.length > 0))
    return candidates[0];

  return null;
}

export function findCancellation(data: AllData, amount: number, date: DateTime, id?: string) {

  let candidates = data.bank.filter(b => b.Amount === -amount);
  candidates = candidates.filter(b =>
    b.Description.startsWith('INTERAC e-Transfer cancel')||
    b.Description === 'Expired INTERAC e-Transfer credit'
)

  // early-exit optimization
  if (candidates.length === 0)
    return undefined;

  // get ids of cancelled transfers
  const index = candidates
    .map(c => c.Description.match(/\d+$/))
    .findIndex(m => m && m[0] === id);
  if (index >= 0)
    return candidates[index];

  // only those that occured within the next 40 days
  candidates = filterCandidates(candidates, "Date", date.plus({days: 20}), 40);
  if (candidates.length === 1)
    return candidates[0];
  else if (candidates.length > 1) {
    console.error('Better specificity required');
  }
  return undefined;
}
