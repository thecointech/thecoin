import type { ElementSearchParams, FoundElement } from "@thecointech/scraper-types";
import { getTest } from "./data";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { getSnapshot, saveSnapshot } from "@thecointech/scraper-archive";
import type { TestData, TestElmData } from "@thecointech/scraper-archive";
import { writeFileSync } from "node:fs";
import path from "node:path";

// TODO: De-duplicate this with updateArchive.ts
export async function updateTest(key: string, element: string) {

  const test = getTest(key);
  const page = await test.page();
  const sch = test.sch(element);
  const elm = test.elm(element);
  const timestamp = new Date();

  const onFound = async (candidate: FoundElement, _params: ElementSearchParams, candidates: FoundElement[]) => {
    // Write out the snapshot...
    saveSnapshot(test, element, timestamp, elm, candidate, candidates);
  }
  const found = await getElementForEvent({
    ...sch,
    page,
    timeout: 1000
  }, onFound);

  return (
    found.data.selector == elm.data.selector &&
    found.data.text == elm.data.text
  )
}

export type ApplyResult = {
  success: boolean;
  changes: Partial<Pick<TestElmData["data"], "text" | "selector" | "coords">>;
}

export async function applyOverrideFromSnapshot(test: TestData, element: string): Promise<ApplyResult> {
  // Get the latest snapshot
  const snapshots = test.snapshots(element, 1);
  if (snapshots.length === 0) {
    throw new Error(`No snapshots found for ${test.key}/${element}`);
  }

  // Read the snapshot data
  const snapshot = getSnapshot(snapshots[0]);
  const found = snapshot.found;

  // Get the original element data
  const original = test.elm(element);
  if (!original) {
    throw new Error(`Element ${element} not found in test ${test.key}`);
  }

  // Determine what changed
  const changes: ApplyResult["changes"] = {};
  if (found.data.text !== original.data.text) {
    changes.text = found.data.text;
  }
  if (found.data.selector !== original.data.selector) {
    changes.selector = found.data.selector;
  }
  if (JSON.stringify(found.data.coords) !== JSON.stringify(original.data.coords)) {
    changes.coords = found.data.coords;
  }

  // If nothing changed, no action needed
  if (Object.keys(changes).length === 0) {
    return { success: false, changes: {} };
  }

  // Find the elm file for this element
  const elmFile = test.elm_files().find(f => f.includes(element));
  if (!elmFile) {
    throw new Error(`Elm file for ${element} not found in test ${test.key}`);
  }

  const elmPath = path.join(test.matchedFolder, elmFile);
  writeFileSync(elmPath, JSON.stringify(found, null, 2));

  return { success: true, changes };
}
