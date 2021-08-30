import { reconcileExternal } from "./reconcileExternal";
import { matchDB } from "./matchDb";
import { addReconciled } from "./utils";
import { AllData } from "./types";

export async function matchAll(data: AllData) {
  const txs = matchDB(data);
  const ext = await reconcileExternal(data);
  addReconciled(txs, ext);

  return txs;
}
