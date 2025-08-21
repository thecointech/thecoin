import { existsSync, readFileSync } from "node:fs";
import { ElementData } from "../src/types";
import path from "node:path";

type OverrideElements = {
  text?: string,
  selector?: string
}
export type OverrideData = {
  skip?: string[],
  overrides?: Record<string, Record<string, OverrideElements[]>>
}

export function getOverrideData(testFolder: string): OverrideData {
  const overrideFile = path.join(testFolder, "record-archive", "overrides.json")
  if (existsSync(overrideFile)) {
    const raw = readFileSync(overrideFile, "utf-8")
    const overrideData = JSON.parse(raw);
    return overrideData;
  }
  return {};
}

export function applyOverrides(overrideData: OverrideData, key: string, element: string, counter: number, rawJson: ElementData) {
  const overrides = overrideData.overrides?.[key];
  if (overrides) {
    const elementOverride = overrides[element]?.[counter];
    if (elementOverride) {
      if (elementOverride.text) rawJson.text = elementOverride.text;
      if (elementOverride.selector) rawJson.selector = elementOverride.selector;
    }
  }
}
