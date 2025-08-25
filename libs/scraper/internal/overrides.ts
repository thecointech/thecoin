import { existsSync, readFileSync } from "node:fs";
import { ElementData } from "../src/types";
import path from "node:path";

export type OverrideElement = {
  text?: string,
  selector?: string
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

export function getOverrideData(testFolder: string): OverrideData {
  const overrideFile = path.join(testFolder, "archive", "overrides.json")
  if (existsSync(overrideFile)) {
    const raw = readFileSync(overrideFile, "utf-8")
    const overrideData = JSON.parse(raw);
    return overrideData;
  }
  return {};
}

export function applyOverrides(overrideData: OverrideData, key: string, element: string, rawJson: ElementData) {
  const overrides = overrideData.overrides?.[key];
  if (overrides) {
    const elementOverride = overrides[element];
    if (elementOverride) {
      if (elementOverride.text) rawJson.text = elementOverride.text;
      if (elementOverride.selector) rawJson.selector = elementOverride.selector;
    }
  }
}
