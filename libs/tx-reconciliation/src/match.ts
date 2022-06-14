import { matchDB } from "./matchDb.js";
import { AllData } from "./types.js";
import { matchManual } from './matchManual.js';

export async function matchAll(data: AllData) {
  // Finally, add any overrides (still) necessary;
  matchManual(data);

  const txs = matchDB(data);

  return txs;
}
