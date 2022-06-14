import { filterCandidates } from "./utils.js";
import { BuyAction } from "@thecointech/broker-db";
import { AllData, User, ReconciledRecord } from "./types.js";

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
  const email = record.data.type === "Buy"
    ? findEmail(data, user, record.database as BuyAction, maxDays)
    : null;

  if (email) {
    return data.eTransfers.splice(data.eTransfers.indexOf(email), 1)[0];
  }
  return null;
}

export function findEmail(data: AllData, user: User, deposit: BuyAction, maxDays: number) {
  const { initialId, date, initial } = deposit.data;
  if (initialId)
    return data.eTransfers.find(et => et.id === initialId);

  // basic requirements
  let candidates = data.eTransfers.filter(et => et.address === user.address);
  candidates = candidates.filter(et => et.cad.eq(initial.amount));

  candidates = filterCandidates(candidates, "recieved", date, maxDays);
  if (candidates.length === 1 || (maxDays === 0 && candidates.length > 0))
    return candidates[0];

  return null;
}
