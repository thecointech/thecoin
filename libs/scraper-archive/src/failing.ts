// Simple helper functions

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tests } from "./paths";

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
  try {
    return tests("archive", "failing.json")
  }
  catch (e) {
    return null;
  }
}
