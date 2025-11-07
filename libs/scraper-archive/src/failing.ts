// Simple helper functions

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { TestData } from "./testData";

export function getLastFailing(): string[] | null {
  const file = lastFailingFile();
  if (!file) return null;
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, "utf-8"));
  }
  return null;
}

export function writeLastFailing(failing: Set<string>) {
  const file = lastFailingFile();
  if (!file) return;
  writeFileSync(file, JSON.stringify(Array.from(failing), null, 2));
}

function lastFailingFile() {
  return process.env.PRIVATE_TESTING_PAGES
    ? path.join(process.env.PRIVATE_TESTING_PAGES, "archive", `failing.json`)
    : null;
}


export function shouldSkip(test: TestData, includeFilter?: string[]) {
  // If missing data, just skip
  if (!test.hasSnapshot() || test.searches().length == 0) {
    return true;
  }
  if (includeFilter) {
    return !includeFilter.includes(test.key);
  }
  return false
}
