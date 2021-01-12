import { filterCandidates, toDateTime } from "./utils";
import { AllData, ReconciledRecord, User } from "./types";
import { BaseTransactionRecord } from "@the-coin/tx-firestore";
import { UserAction } from "@the-coin/utilities/User";

// Next, the tx hash should match blockchain
export function spliceBank(data: AllData, user: User, record: ReconciledRecord, maxDays: number) {
  let tx = findBank(data, user, record.data, record.action, maxDays);
  if (tx)
    data.bank.splice(data.bank.indexOf(tx), 1);
  return tx;
}

function findBank(data: AllData, user: User, record: BaseTransactionRecord, action: UserAction, maxDays: number) {

  const amount = record.fiatDisbursed * (action == "Buy" ? 1 : -1);
  // raw filter
  let candidates = data.bank.filter(tx => tx.Amount === amount);

  candidates = action == "Buy"
    ? candidates.filter(tx => tx.Description === 'e-Transfer received')
    : candidates.filter(tx => tx.Description === 'e-Transfer sent');

  if (user.names.length > 0 && action == "Buy")
    candidates = candidates.filter(tx => !tx.Details || user.names.includes(tx.Details));

  // Filter by date
  const completed = toDateTime(record.completedTimestamp);
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
