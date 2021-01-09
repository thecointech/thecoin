import { DateTime } from "luxon";
import { AllData } from "./types";

// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, amount: number, completed: DateTime|null, names: string[]) {
  let tx = findBank(data, amount, completed, names);
  if (tx)
    data.bank.splice(data.bank.indexOf(tx), 1);
  else {
    console.error(`No tx found for transaction of ${amount} to ${names}`);
    debugger;
  }
  return tx;
}

function findBank(data: AllData, amount: number, completed: DateTime|null, names: string[]) {
  // raw filter
  let candidates = data.bank.filter(tx => tx.Description === 'e-Transfer received');
  candidates = candidates.filter(tx => tx.Amount === amount);
  // filter by name
  if (completed) {
  // first, do we have an exact match?
    let exact = candidates.filter(tx => Math.abs(tx.Date.diff(completed, "days").days) < 1);
    exact = exact.filter(tx => !tx.Details|| names.includes(tx.Details));
    if (exact.length == 1)
      return exact[0];

    candidates = candidates.sort((l, r) => Math.abs(l.Date.diff(completed).milliseconds) - Math.abs(r.Date.diff(completed).milliseconds));
    // How many potentials do we have?
    //const cutoff = completed.plus({ days: 7 });
    //candidates = candidates.filter(tx => tx.Date < cutoff);
  }

  // if we still can't make up our mind, try filtering on name
  if (completed && candidates.length >= 1 && names.length > 0) {
    candidates = candidates.filter(tx => !tx.Details || names.includes(tx.Details));

    // Right person, right time: close enough
    if (candidates[0].Date.diff(completed, "days").days <= 5)
      return candidates[0];
  }

  // if (candidates.length == 0) {
  //   console.warn(`No candidate found for deposit: ${amount} to ${names}`);
  // }
  // else if (candidates.length != 1)
  //   return null;
  // }
  if (candidates.length > 0)
    console.error(`Loose match here on ${amount} to ${names}`);

  return candidates[0];
}
