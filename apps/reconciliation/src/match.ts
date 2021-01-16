import { writeFileSync } from "fs";
import { join } from "path";
import { reconcileExternal } from "./reconcileExternal";
import { matchDB } from "./matchDb";
import { addReconciled } from "./utils";

export async function matchAll(data: AllData) {
  const txs = matchDB(data);
  const ext = await reconcileExternal(data);
  addReconciled(txs, ext);
  return txs;
}


export function writeMatched(matched: Reconciliations) {
  writeFileSync(
    join(__dirname, 'matched.json'),
    JSON.stringify(matched)
  )
}
