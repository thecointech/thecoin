import path from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { globSync } from "glob";
import type { Page } from "puppeteer";
import type { ElementData, ElementSearchParams, FoundElement } from "../src/types";
import { useTestBrowser } from "./testutils";
import { waitPageStable } from "../src/utilities";

export type VqaCallData = {
  args: string[],
  response: any,
}
// See matching type
export type TestElmData = FoundElement["data"]
export type TestSchData = {
  score: number,
  components: any,
  search: Omit<ElementSearchParams, "page">
}

export type TestData = {
  key: string,
  page(): Promise<Page>;
  target: string,
  step: string,
  hasSnapshot: () => boolean,
  // Find all elements
  elements: () => string[],
  vqa: (name: string) => VqaCallData|null,
  elm: (name: string) => TestElmData|null,
  sch: (name: string) => TestSchData|null,
  toString: () => string,
}
export function getTestData(section: string, searchPattern: string, recordTime = 'record-latest') {

  const { getPage } = useTestBrowser();

  const testingFolder = process.env.PRIVATE_TESTING_PAGES;
  if (!testingFolder) {
    return [];
  }
  const testFolder = path.join(testingFolder, "unit-tests")
  const baseFolder = path.join(testFolder, recordTime);
  const overrideData = getOverrideData(testFolder);
  const results: TestData[] = [];
  const pattern = `${baseFolder}/**/${section}/**/*${searchPattern}*`
  const matched = globSync(pattern);
  for (const match of matched) {

    const matchedFolder = path.dirname(match);
    const machedFilename = path.basename(match);
    const step = machedFilename.split('-')[0]
    const key = `${path.relative(testFolder, matchedFolder)}-${step}`
    if (results.find(r => r.key == key)) {
      continue
    }
    // Is this meant to be skipped?
    if (overrideData.skip?.includes(key)) {
      continue;
    }
    const allPagesAndElements = readdirSync(matchedFolder);
    // If no png/etc move on, we've matched something irrelevant
    if (!existsSync(path.join(matchedFolder, `${step}.png`))) {
      continue;
    }
    const pathBits = matchedFolder.split(path.sep).reverse()
    const target = pathBits[1] == section
      ? pathBits[2]
      : pathBits[1]

    const jsonFiles = allPagesAndElements.filter(f => f.startsWith(step));
    const elmQueryCounters: Record<string, number> = {}
    results.push({
      target,
      key,
      step,
      hasSnapshot: () => existsSync(path.join(matchedFolder, `${step}.mhtml`)),
      page: async () => {
        const filename = `${matchedFolder}/${step}.mhtml`;
        const url = `file://${filename.replace(" ", "%20")}`;
        const page = await getPage()
        await page.goto(url)
        await waitPageStable(page);
        return page;
      },
      elements: () => jsonFiles.filter(f => f.endsWith("-elm.json")),
      vqa: (call: string) => {
        const f = jsonFiles.find(f => f.includes(call) && f.endsWith("-vqa.json"))
        if (f) {
          return JSON.parse(readFileSync(path.join(matchedFolder, f), "utf-8"))
        }
        return null;
      },
      elm: (name: string) => {
        const counter = elmQueryCounters[name] ?? 0;
        elmQueryCounters[name] = counter + 1;
        const elements = jsonFiles.filter(f => f.includes(name) && f.endsWith("-elm.json"))
        const f = elements[counter]
        if (f) {
          const rawJson: TestElmData = JSON.parse(readFileSync(path.join(matchedFolder, f), "utf-8"))
          applyOverrides(overrideData, key, name, counter, rawJson);
          return rawJson
        }
        return null;
      },
      sch: (name: string) => {
        // Note: sch is tied to "elm", so we reuse
        // that counter (and don't increment it)
        const counter = elmQueryCounters[name] ?? 0;
        const elements = jsonFiles.filter(f => f.includes(name) && f.endsWith("-sch.json"))
        const f = elements[counter]
        if (f) {
          return JSON.parse(readFileSync(path.join(matchedFolder, f), "utf-8"))
        }
        return null;
      },
      toString: () => key,
    })
  }
  return results;
}

type OverrideElements = {
  text?: string,
  selector?: string
}
export type OverrideData = {
  skip?: string[],
  overrides?: Record<string, Record<string, OverrideElements[]>>
}

function applyOverrides(overrideData: OverrideData, key: string, element: string, counter: number, rawJson: ElementData) {
  const overrides = overrideData.overrides?.[key];
  if (overrides) {
    const elementOverride = overrides[element]?.[counter];
    if (elementOverride) {
      if (elementOverride.text) rawJson.text = elementOverride.text;
      if (elementOverride.selector) rawJson.selector = elementOverride.selector;
    }
  }
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

export const hasTestingPages = () => !!process.env.PRIVATE_TESTING_PAGES;
