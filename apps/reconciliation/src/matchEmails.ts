import { DateTime } from "luxon";
import { filterCandidates } from "./utils";
import { AllData } from "./types";

// Find the most common name associated with an
export function findNames(data: AllData, address: string) {
  const options = data.eTransfers
    .filter(et => et.address === address)
    .map(tx => tx.name);
  // Return array of names associated with this address
  const unique = new Set(options);
  return Array.from(unique);
}

export function  spliceEmail(data: AllData, address: string, amount: number, date: DateTime, maxDays: number, id?: string) {
  const email = findEmail(data, address, amount, date, maxDays, id);
  if (!email) {
    //console.warn(`No e-transfer found for recorded deposit of ${amount} to ${names}`);
    //debugger;
    return null;
  }
  return data.eTransfers.splice(data.eTransfers.indexOf(email), 1)[0];
}

export function findEmail(data: AllData, address: string, amount: number, date: DateTime, maxDays: number, id?: string) {

  if (id)
    return data.eTransfers.find(et => et.id == id);

  // basic requirements
  let candidates = data.eTransfers.filter(et => et.address === address);
  candidates = candidates.filter(et => et.cad.eq(amount));

  candidates = filterCandidates(candidates, "recieved", date, maxDays);
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
