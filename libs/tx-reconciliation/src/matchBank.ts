import { filterCandidates } from "./utils";
import { ActionType } from "@thecointech/broker-db";
import { DateTime } from "luxon";
import { AllData, User, BankRecord } from "./types";
import Decimal from 'decimal.js-light';
import { distance } from 'fastest-levenshtein';

type BankFilter = ReturnType<typeof getFilter>;


// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, user: User, amount: Decimal, date: DateTime, maxDays: number, type?: ActionType) {

  // Find TX
  const names = type == "Buy" ? user.names : undefined;
  const _amount = type == "Buy" ? amount : amount.neg();
  const _date = date.set({hour: 0, minute: 0, second: 0, millisecond: 0});

  // Find most recent completion attempt
  const filter = getFilter(type);
  const tx = findBank(data, maxDays, _amount, _date, filter, names);
  if (tx) {
    data.bank.splice(data.bank.indexOf(tx), 1);
  }
  return tx;
}


export const getFilter = (type?: ActionType): (tx: BankRecord) => boolean => {
   // TODO: Filter by meta too
  switch (type) {
    case "Bill": return tx => tx.Description.startsWith('Online Banking payment');
    case "Sell": return tx => tx.Description === 'e-Transfer sent';
    case "Buy": return tx => tx.Description === 'e-Transfer received' || tx.Description === 'e-Transfer - Request Money';
    case undefined: return _ => true;
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
    candidates = candidates.filter(tx => !tx.Details || names.find(name => distance(name, tx.Details!) < 5));

  // Filter by date
  if (date)
    candidates = filterCandidates(candidates, "Date", date, maxDays);

  // Do we have a candidate?
  if (candidates.length) {
    if (candidates.length === 1)
      return candidates[0];

    // If the candidates are equivalent, just pick one
    const dates = new Set(candidates.map(c => c.Date.toMillis()));
    const details = new Set(candidates.map(c => c.Details));
    if (dates.size === 1 && (details.size === 1 || maxDays > 10))
      return candidates[0];
  }

  return null;
}

export function findCancellation(data: AllData, amount: number, date: DateTime, id?: string) {

  let candidates = data.bank.filter(b => b.Amount === -amount);
  candidates = candidates.filter(b =>
    b.Description.startsWith('INTERAC e-Transfer cancel') ||
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
  candidates = filterCandidates(candidates, "Date", date.plus({ days: 20 }), 40);
  if (candidates.length === 1)
    return candidates[0];
  else if (candidates.length > 1) {
    console.error('Better specificity required');
  }
  return undefined;
}
