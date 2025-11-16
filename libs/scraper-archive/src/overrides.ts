import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Coords } from "@thecointech/scraper-types";
import { tests } from "./paths";

export type OverrideElement = {
  text?: string,
  selector?: string,
  coords?: Coords
}
export type SkipElement = {
  reason?: string,
  // If elements is specified, only skip those elements
  elements?: string[],
}
export type SkipElements = Record<string, SkipElement>
export type OverrideData = {
  skip?: SkipElements,
  overrides?: Record<string, Record<string, OverrideElement>>
}

export function getOverrideData(): OverrideData {
  const overrideFile = tests("archive", "overrides.json")
  if (existsSync(overrideFile)) {
    const raw = readFileSync(overrideFile, "utf-8")
    const overrideData = JSON.parse(raw);
    return overrideData;
  }
  return {};
}

export function writeOverrideData(overrides: OverrideData, mainFile?: boolean) {
  const overridePath = tests("archive", mainFile ? "overrides.json" : `overrides-${Date.now()}.json`);
  writeFileSync(overridePath, JSON.stringify(overrides, null, 2));
}

