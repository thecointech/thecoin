import { matchDB } from "./matchDb";
import { AllData } from "./types";
import { matchManual } from './matchManual';

export async function matchAll(data: AllData) {
  const txs = matchDB(data);

  // Finally, add any overrides (still) necessary;
  matchManual(txs, data);

  return txs;
}
