import { filterCandidates, toDateTime } from "./utils";
import { AllData, ReconciledRecord, User } from "./types";
import { DepositRecord } from "@the-coin/tx-firestore";

// Find the most common name associated with an
export function findNames(data: AllData, address: string) {
  const options = data.eTransfers
    .filter(et => et.address === address)
    .map(tx => tx.name);
  // Return array of names associated with this address
  const unique = new Set(options);
  return Array.from(unique);
}

export function spliceEmail(data: AllData, user: User, record: ReconciledRecord, maxDays: number) {
  const email = record.action == "Buy"
    ? findEmail(data, user, record.data as DepositRecord, maxDays)
    : null;

  if (email) {
    return data.eTransfers.splice(data.eTransfers.indexOf(email), 1)[0];
  }
  return null;
}

export function findEmail(data: AllData, user: User, deposit: DepositRecord, maxDays: number) {
  const { sourceId, recievedTimestamp, fiatDisbursed } = deposit;
  if (sourceId)
    return data.eTransfers.find(et => et.id == sourceId);

  // basic requirements
  let candidates = data.eTransfers.filter(et => et.address === user.address);
  candidates = candidates.filter(et => et.cad.eq(fiatDisbursed));

  candidates = filterCandidates(candidates, "recieved", toDateTime(recievedTimestamp), maxDays);
  if (candidates.length == 1 || (maxDays == 0 && candidates.length > 0))
    return candidates[0];

  return null;


  // if (candidates[0]?.recieved.equals(date))
  //   return candidates[0];

  // // not exact, lets get fuzzy!  First, make sure our closest match is on the right side of history
  // candidates = candidates.filter(et => et.recieved.minus({days: 1}) <= date);

  // // If we have only one option, and it's reasonably close, lets take it.
  // if (candidates.length == 1)
  // {
  //   const candidate = candidates[0];
  //   if (candidate.recieved.diff(date).get("days") < 5)
  //     return candidate;
  // }
  // return undefined;
}
