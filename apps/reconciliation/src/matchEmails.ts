import { eTransferData } from "@the-coin/tx-gmail/";
import { DateTime } from "luxon";
import { AllData } from "./types";

// function mode(arr: string[]){
//   return arr.sort((a,b) =>
//         arr.filter(v => v===a).length
//       - arr.filter(v => v===b).length
//   ).pop();
// }

// Find the most common name associated with an
export function findNames(data: AllData, address: string) {
  const options = data.eTransfers
    .filter(et => et.address === address)
    .map(tx => tx.name);
  // Return array of names associated with this address
  const unique = new Set(options);
  return Array.from(unique);
}

export function  spliceEmail(data: AllData, address: string, amount: number, date: DateTime, names: string[], id?: string) {
  const email = findEmail(data, address, amount, date, id);
  if (!email) {
    console.warn(`No e-transfer found for recorded deposit of ${amount} to ${names}`);
    debugger;
    return null;
  }
  return data.eTransfers.splice(data.eTransfers.indexOf(email), 1)[0];
}

type Dateable<T> = {
  [P in keyof T]: DateTime
};
function compareByClosestTo<T extends Dateable<T>>(key: keyof T, date: DateTime) {
  return (l: T, r: T) => Math.abs(l[key].diff(date).milliseconds) - Math.abs(r[key].diff(date).milliseconds)
}


export function findEmail(data: AllData, address: string, amount: number, date: DateTime, id?: string) {

  if (id)
    return data.eTransfers.find(et => et.id == id);

  // basic requirements
  let candidates = data.eTransfers.filter(et => et.address === address);
  candidates = candidates.filter(et => et.cad.eq(amount));

  // sort by closest to date
  candidates.sort(
    compareByClosestTo<eTransferData>("recieved", date))
  );  //(l, r) => Math.abs(l.recieved.toMillis() - r.recieved.toMillis())).reverse();
  // Do we have an exact match?
  if (candidates[0]?.recieved.equals(date))
    return candidates[0];

  // not exact, lets get fuzzy!  First, make sure our closest match is on the right side of history
  candidates = candidates.filter(et => et.recieved.minus({days: 1}) <= date);

  // If we have only one option, and it's reasonably close, lets take it.
  if (candidates.length == 1)
  {
    const candidate = candidates[0];
    if (candidate.recieved.diff(date).get("days") < 5)
      return candidate;
  }
  return undefined;
}
