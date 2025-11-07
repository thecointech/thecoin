import type { TestData } from "./testData";
import type { FoundElement } from "@thecointech/scraper-types";
import path from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import type { TestElmData, SnapshotData } from "./types";

const SNAPSHOT_FOLDER = "__snapshots__";
export function saveSnapshot(test: TestData, element: string, timestamp: number, original: TestElmData, found: FoundElement, candidates: FoundElement[]) {

  const snapshotFolder = path.join(test.matchedFolder, SNAPSHOT_FOLDER);
  if (!existsSync(snapshotFolder)) {
    mkdirSync(snapshotFolder, { recursive: true });
  }

  const snapshotFile = path.join(snapshotFolder, `${element}-elm-${timestamp}.json`);

  const data = getWriteData(original, found, candidates);
  writeFileSync(snapshotFile, JSON.stringify(data, null, 2));
}

  // Useful things in a snapshot:
  //  - found element
  //  - expected results (if not found)
  //  - top 10 candidates
function getWriteData(original: TestElmData, found: FoundElement, candidates: FoundElement[]): SnapshotData {
  const matched = candidates.find(c => (
    c.data.selector == original.data.selector &&
    c.data.text == original.data.text
  ));
  const top = candidates.slice(0, 10);
  if (matched != found) {
    return {
      found,
      match: matched,
      top,
    }
  }
  return {
    found,
    top,
  }
}
