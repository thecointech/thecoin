import { DateTime } from "luxon";
import { filterCandidates } from "./utils";
import { AllData } from "./types";

// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, amount: number, completed: DateTime|undefined, maxDays: number, names: string[], description?: string) {
  let tx = findBank(data, amount, completed, maxDays, names, description);
  if (tx)
    data.bank.splice(data.bank.indexOf(tx), 1);
  return tx;
}

function findBank(data: AllData, amount: number, completed: DateTime|undefined, maxDays: number, names: string[], description?: string) {
  // raw filter
  let candidates = data.bank.filter(tx => tx.Amount === amount);

  if (description)
    candidates =candidates.filter(tx => tx.Description === description)
  if (names.length > 0)
    candidates = candidates.filter(tx => !tx.Details || names.includes(tx.Details));

  // Filter by date
  if (completed)
    candidates = filterCandidates(candidates, "Date", completed, maxDays);

  // Do we have a candidate?
  if (candidates.length == 1 || (maxDays < 2 && candidates.length > 0))
    return candidates[0];

  return null;

  // // if we still can't make up our mind, try filtering on name
  // if (completed && candidates.length >= 1 && names.length > 0) {


  // // Do we have a candidate?
  // if (candidates.length == 1 || (maxDays == 0 && candidates.length > 0))
  // return candidates[0];

  // return null;
  // // filter by name
  // if (completed) {
  // // first, do we have an exact match?
  //   let exact = candidates.filter(tx => Math.abs(tx.Date.diff(completed, "days").days) < 1);
  //   exact = exact.filter(tx => !tx.Details|| names.includes(tx.Details));
  //   if (exact.length == 1)
  //     return exact[0];

  //   candidates = candidates.sort((l, r) => Math.abs(l.Date.diff(completed).milliseconds) - Math.abs(r.Date.diff(completed).milliseconds));
  //   // How many potentials do we have?
  //   //const cutoff = completed.plus({ days: 7 });
  //   //candidates = candidates.filter(tx => tx.Date < cutoff);
  // }



  //   // Right person, right time: close enough
  //   if (candidates[0].Date.diff(completed, "days").days <= 5)
  //     return candidates[0];
  // }

  // // if (candidates.length == 0) {
  // //   console.warn(`No candidate found for deposit: ${amount} to ${names}`);
  // // }
  // // else if (candidates.length != 1)
  // //   return null;
  // // }
  // if (candidates.length > 0)
  //   console.error(`Loose match here on ${amount} to ${names}`);

  // return candidates[0];
}
