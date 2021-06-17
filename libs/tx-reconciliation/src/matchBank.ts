import { filterCandidates } from "./utils";
import { ActionType } from "@thecointech/broker-db";
import { DateTime } from "luxon";
import { AllData, User, ReconciledRecord, BankRecord } from "types";
import Decimal from 'decimal.js-light';

type BankFilter = ReturnType<typeof getFilter>;

// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, user: User, record: ReconciledRecord, maxDays: number) {

  const r = record.bank;
  if (r.length % 2 !== 1) {

    // Find TX
    const transition = record.action.history.filter(ts => ts.fiat !== undefined);
    transition.forEach(tr => {
      const amount = tr.fiat!;
      const names = record.action.type === "Buy" ? user.names : undefined;

      // Find most recent completion attempt
      const filter = getFilter(record.action.type);
      const tx = findBank(data, maxDays, amount, tr.date, filter, names);
      if (tx) {
        data.bank.splice(data.bank.indexOf(tx), 1);
        r.push(tx);
      }
    })
  }
  return r;
}

export const getFilter = (action: ActionType): (tx: BankRecord) => boolean => {
  switch (action) {
    case "Bill": return tx => tx.Description.startsWith('Online Banking payment');
    case "Sell": return tx => tx.Description === 'e-Transfer sent';
    case "Buy": return tx => tx.Description === 'e-Transfer received' || tx.Description === 'e-Transfer - Request Money';
    default:
      throw new Error("Unknown action type");
  }
}

export function findBank(data: AllData, maxDays: number, amount: Decimal, date?: DateTime, filter?: BankFilter, names?: string[]) {
  // raw filter
  let candidates = data.bank.filter(tx => amount.eq(tx.Amount));

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
