import { writeFileSync } from "fs";
import { join } from "path";
import { matchDB } from "./matchDb";
import { AllData } from "./types";

export function matchAll(data: AllData) {
  const txs = matchDB(data);
  return txs;
}

type Matched = ReturnType<typeof matchAll>
export function writeMatched(matched: Matched) {
  writeFileSync(
    join(__dirname, 'matched.json'),
    JSON.stringify(matched)
  )
}
