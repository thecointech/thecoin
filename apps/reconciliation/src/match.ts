import { writeFileSync } from "fs";
import { join } from "path";
import { reconcileExternal } from "./reconcileExternal";
import { matchDB } from "./matchDb";
import { AllData } from "./types";
import { addReconciled } from "./utils";

export function matchAll(data: AllData) {
  const txs = matchDB(data);
  const ext = reconcileExternal(data);
  addReconciled(txs, ext);
  return txs;
}

type Matched = ReturnType<typeof matchAll>
export function writeMatched(matched: Matched) {
  writeFileSync(
    join(__dirname, 'matched.json'),
    JSON.stringify(matched)
  )
}
