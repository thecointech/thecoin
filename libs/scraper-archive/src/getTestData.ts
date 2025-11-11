import path from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { globSync } from "glob";
import { TestData } from "./testData";
import { getOverrideData, type SkipElement } from "./overrides";
import type { Page } from "puppeteer";
import { tests } from "./paths";

export type TestDataConstructor<T extends TestData = TestData> = new (...args: ConstructorParameters<typeof TestData>) => T;

export function getTestData<T extends TestData>(
  section: string,
  searchPattern: string,
  recordTime = 'latest',
  constructor: TestDataConstructor<T> = TestData as any,
  getPage: (url: string) => Promise<Page>
): T[] {

  const testFolder = tests();
  if (!testFolder) {
    return [];
  }
  const overrideData = getOverrideData();
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
    const key = `${path.relative(testFolder, matchedFolder).replaceAll(path.sep, ':')}:${step}`
    if (results.find(r => r.key == key)) {
      continue
    }
    // Is this meant to be skipped?
    const skip = overrideData.skip?.[key];
    if (skip && !skip.elements) {
      continue;
    }
    // If no png/mhtml, move on, we've matched something irrelevant
    if (!existsSync(path.join(matchedFolder, `${step}.png`))) {
      continue;
    }
    if (!existsSync(path.join(matchedFolder, `${step}.mhtml`))) {
      continue;
    }

    // Ensure we have actual data to test as well.
    const jsonFiles = getJsonFiles(matchedFolder, step, skip);
    if (skip) {
      jsonFiles.filter(f => skip.elements?.every(e => !f.includes(e)));
    }
    if (!jsonFiles.length) {
      continue;
    }

    const pathBits = matchedFolder.split(path.sep).reverse()
    const target = pathBits[1] == section
      ? pathBits[2]
      : pathBits[1]

    const test = new constructor(
      key,
      target,
      step,
      matchedFolder,
      jsonFiles,
      overrideData,
      getPage
    )

    // Final testing
    if (!filterElmTestsForSearchValues(test, jsonFiles)) {
      continue;
    }
    results.push(test);
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

function filterElmTestsForSearchValues(test: TestData, jsonFilesRef: string[]) {

  // Super hacky, but go through the searches & remove
  // any that don't have a valid search event.
  test.names().forEach(name => {
      const sch = test.sch(name);
      if (sch?.event.estimated) {
        return;
      }
      // If no search data, remove entirely from jsonFiles
      for (const f of jsonFilesRef.filter(f => !f.includes(name))) {
        jsonFilesRef.splice(jsonFilesRef.indexOf(f), 1);
      }
    });

  // If missing data, just skip
  if (test.searches().length == 0 || test.elements().length == 0) {
    return false;
  }

  return true;
}
