import path from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { globSync } from "glob";
import { useTestBrowser } from "./testutils";
import { TestData } from "./testData";
import { getOverrideData, OverrideData } from "./overrides";

type TestDataConstructor<T extends TestData = TestData> = new (...args: ConstructorParameters<typeof TestData>) => T;

export function getTestData<T extends TestData>(
  section: string,
  searchPattern: string,
  recordTime = 'record-latest',
  constructor: TestDataConstructor<T> = TestData as any
): T[] {

  const { getPage } = useTestBrowser();

  const testingFolder = process.env.PRIVATE_TESTING_PAGES;
  if (!testingFolder) {
    return [];
  }
  const testFolder = path.join(testingFolder, "unit-tests")
  const baseFolder = path.join(testFolder, recordTime);
  const overrideData = getOverrideData(testFolder);
  const results: T[] = [];
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

export const hasTestingPages = () => !!process.env.PRIVATE_TESTING_PAGES;
