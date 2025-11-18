import type { ElementSearchParams, FoundElement } from "@thecointech/scraper-types";
import { getTest } from "./data";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { getSnapshot, saveSnapshot } from "@thecointech/scraper-archive";
import type { OverrideData, OverrideElement, TestData } from "@thecointech/scraper-archive";
import { getOverrideData, writeOverrideData } from "@thecointech/scraper-archive";
import { readFileSync } from "node:fs";

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

export async function applyOverrideFromSnapshot(test: TestData, element: string): Promise<{ success: boolean, changes: OverrideElement }> {
  // Get the latest snapshot
  const snapshots = test.snapshots(element, 1);
  if (snapshots.length === 0) {
    throw new Error(`No snapshots found for ${test.key}/${element}`);
  }

  // Read the snapshot data
  const snapshot = getSnapshot(snapshots[0]);
  const found = snapshot.found;

  // Get the original element data (without overrides)
  const original = test.elm(element, false);
  if (!original) {
    throw new Error(`Element ${element} not found in test ${test.key}`);
  }

  // Determine what changed
  const changes: OverrideElement = {};
  if (found.data.text !== original.data.text) {
    changes.text = found.data.text;
  }
  if (found.data.selector !== original.data.selector) {
    changes.selector = found.data.selector;
  }
  if (JSON.stringify(found.data.coords) !== JSON.stringify(original.data.coords)) {
    changes.coords = found.data.coords;
  }

  // Get existing overrides
  const overrideData: OverrideData = getOverrideData();

  // If nothing changed, remove the override
  if (Object.keys(changes).length === 0) {
    return { success: false, changes: {} };
  }

  else {
    // Initialize overrides structure if needed
    if (!overrideData.overrides) {
      overrideData.overrides = {};
    }
    if (!overrideData.overrides[test.key]) {
      overrideData.overrides[test.key] = {};
    }

    // Apply the override
    overrideData.overrides[test.key][element] = changes;

    // Save the overrides
    writeOverrideData(overrideData, true);

    return { success: true, changes };
  }

}
