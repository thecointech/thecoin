import { DateTime } from "luxon";
import { AllData } from "./types";

export function findName(data: AllData, address: string) {
  return data.eTransfers.find(et => et.address === address)?.name;
}

export function  spliceEmail(data: AllData, address: string, amount: number, date: DateTime, id?: string) {
  const email = findEmail(data, address, amount, date, id);
  if (email)
    return data.eTransfers.splice(data.eTransfers.indexOf(email), 1)[0];
  return null;
}
export function findEmail(data: AllData, address: string, amount: number, date: DateTime, id?: string) {

  if (id)
    return data.eTransfers.find(et => et.id == id);

  let candidates = data.eTransfers.filter(et => et.address === address);
  candidates.sort((l, r) => Math.abs(l.recieved.toMillis() - r.recieved.toMillis()));
  candidates = candidates.filter(et => et.cad.eq(amount));
  candidates = candidates.filter(et => et.recieved.minus({days: 1}) <= date);

  if (candidates.length == 0)
    return undefined;

  const candidate = candidates[0];
  if (candidate.recieved.diff(date).get("days") > 5)
  {
    console.warn("No e-transfer found found for candidate");
    return undefined;
  }
  return candidate;
}
