import { TestData } from "./testData";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ElementData, Bounds } from "@thecointech/scraper-types";

// Allow caching all element data for a page.
// This allows quicker iteration & testing on
// any scoring changes

const MIN_ELEMENTS_IN_VALID_PAGE = 25;

export type ElementCache = {
  bounds: Bounds,
  candidates: ElementData[],
}

export function writeElementCache(test: TestData, bounds: Bounds, candidates: { data: ElementData }[]) {

  if (candidates.length < MIN_ELEMENTS_IN_VALID_PAGE) {
    console.error(`Not enough elements to cache for ${test.key}`)
    return;
  }
  const toSave: ElementCache = {
    bounds,
    candidates: candidates.map(c => c.data),
  }
  writeFileSync(elementsFile(test),
    JSON.stringify(toSave, null, 2)
  )
}

export function readElementCache(test: TestData): ElementCache {
  const elements = readFileSync(elementsFile(test), "utf-8");
  return JSON.parse(elements) as ElementCache;
}

const elementsFile = (test: TestData) => join(test.matchedFolder, `${test.step.toString()}.elements.json`);
