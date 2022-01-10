import { reconcileExternal } from "./reconcileExternal";
import { matchDB } from "./matchDb";
import { addReconciled } from "./utils";
import { AllData } from "./types";
import { matchManual } from './matchManual';

export async function matchAll(data: AllData) {
  const txs = matchDB(data);
  // Manually adjust some settings
  const ext = await reconcileExternal(data);
  addReconciled(txs, ext);

  // Finally, add any overrides (still) necessary;
  matchManual(txs, data);

  return txs;
}
