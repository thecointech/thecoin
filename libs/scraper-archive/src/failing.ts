import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tests } from "./paths";

// List of marked failing tests
// This should be updated by the updateArchive script in scraper

export type TestID = {
  key: string;
  name: string;
}
export function getLastFailing(): TestID[] | null {
  const file = lastFailingFile();
  if (!file) return null;
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, "utf-8"));
  }
  return null;
}

export function writeLastFailing(failing: TestID[]) {
  const file = lastFailingFile();
  if (!file) return;
  writeFileSync(file, JSON.stringify(failing, null, 2));
}

function lastFailingFile() {
  try {
    return tests("archive", "failing.json")
  }
  catch (e) {
    return null;
  }
}
