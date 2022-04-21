import { matchDB } from "./matchDb";
import { AllData } from "./types";
import { matchManual } from './matchManual';

export async function matchAll(data: AllData) {
  // Finally, add any overrides (still) necessary;
  matchManual(data);

  const txs = matchDB(data);

  return txs;
}
