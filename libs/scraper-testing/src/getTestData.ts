import path from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { globSync } from "glob";
import { TestData } from "./testData";
import { getOverrideData, SkipElement } from "./overrides";
import type { Page } from "puppeteer";
import { newPage } from "@thecointech/scraper";

export type TestDataConstructor<T extends TestData = TestData> = new (...args: ConstructorParameters<typeof TestData>) => T;

export function getTestData<T extends TestData>(
  section: string,
  searchPattern: string,
  recordTime = 'latest',
  constructor: TestDataConstructor<T> = TestData as any,
  getPage: () => Promise<Page>
): T[] {

  if (!getPage) {
    getPage = async () => {
      const { page } = await newPage("default");
      return page;
    }
  }

  const testFolder = process.env.PRIVATE_TESTING_PAGES;
  if (!testFolder) {
    return [];
  }
  const overrideData = getOverrideData(testFolder);
  const results: T[] = [];
  const pattern = `${testFolder}/**/${recordTime}/**/${section}/**/*${searchPattern}*`
  const matched = globSync(pattern);
  for (const match of matched) {

    const matchedFolder = path.dirname(match);
    const machedFilename = path.basename(match);
    const step = parseInt(machedFilename.split('-')[0]);
    if (isNaN(step)) {
      throw new Error(`Invalid step: ${machedFilename}`);
    }
    const key = `${path.relative(testFolder, matchedFolder)}-${step}`
    if (results.find(r => r.key == key)) {
      continue
    }
    // Is this meant to be skipped?
    const skip = overrideData.skip?.[key];
    if (skip && !skip.elements) {
      continue;
    }
    // If no png/etc move on, we've matched something irrelevant
    if (!existsSync(path.join(matchedFolder, `${step}.png`))) {
      continue;
    }
    const jsonFiles = getJsonFiles(matchedFolder, step, skip);
    if (!jsonFiles.length) {
      continue;
    }
    const pathBits = matchedFolder.split(path.sep).reverse()
    const target = pathBits[1] == section
      ? pathBits[2]
      : pathBits[1]

    results.push(new constructor(
      key,
      target,
      step,
      matchedFolder,
      jsonFiles,
      overrideData,
      getPage
    ));
  }
  return results;
}

function getJsonFiles(matchedFolder: string, step: number, skip?: SkipElement) {
  const allPagesAndElements = readdirSync(matchedFolder);
  let jsonFiles = allPagesAndElements.filter(f => f.startsWith(`${step}-`));
  return (skip?.elements)
    ? jsonFiles.filter(f =>
      skip.elements?.every(e => !f.includes(e))
    )
    : jsonFiles;
}

export const hasTestingPages = () => !!process.env.PRIVATE_TESTING_PAGES;
