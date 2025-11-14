import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData } from "../internal/getTestData";
import { getElementForEvent } from "./elements";
import { ElementNotFoundError } from "./errors";
import { type TestData, saveSnapshot, type TestElmData, hasTestingPages } from "@thecointech/scraper-archive";
import type { ElementSearchParams, FoundElement } from "@thecointech/scraper-types";

jest.setTimeout(20 * 60 * 1000);
const MIN_ELEMENTS_IN_VALID_PAGE = 25;

describe("It finds the same elements as before in archive", () => {
  const testData = getTestData("*", "elm.json", "archive");
  const tests = testData.flatMap(t => t.names().map(e => ({ testKey: t.key, test: t, name: e })))
  runTests(tests);
}, hasTestingPages() && (!IsManualRun || process.argv.includes("It finds the same elements as before in archive")));

describe("It runs only the failing tests in archive", () => {
  const testData = getTestData("*", "elm.json", "archive");
  const failing = testData.flatMap(t => t.failing.map(f => ({ testKey: t.key, test: t, name: f })))
  runTests(failing);
}, hasTestingPages() && IsManualRun)

type TestId = {
  testKey: string;
  test: TestData;
  name: string;
}

function runTests(tests: TestId[]) {
  const failed: TestId[] = [];
  const timestamp = new Date();

  console.log(`Found ${tests.length} elements to test`);

  const counter = makeCounter(tests);
  it.each(tests)("Finds the correct element: $testKey - $name", async ({ testKey, test, name }) => {
    counter(failed);
    try {
      const page = await test.page();
      const sch = test.sch(name);
      const elm = test.elm(name);
      expect(elm).toBeDefined();
      expect(sch).toBeDefined();

      const onFound = async (candidate: FoundElement, _params: ElementSearchParams, candidates: FoundElement[]) => {
        // Write out the snapshot...
        saveSnapshot(test, name, timestamp, elm, candidate, candidates);
      }
      const found = await getElementForEvent({
        ...sch,
        page,
        timeout: 500
      }, onFound);

      expect(found.data.text).toEqual(elm.data.text);
      expect(found.data.selector).toEqual(elm.data.selector)
    }
    catch (e) {
      if (e instanceof ElementNotFoundError) {
        // Sometimes, mhtml is a wee bit bung
        const page = await test.page();
        const allElements = await page.$$("*")
        if (allElements.length < MIN_ELEMENTS_IN_VALID_PAGE) {
          console.error(`Element not found, but page is empty, check mhtml on ${test.key}`)
          return;
        }
      }
      failed.push({ testKey, test, name });
      throw e;
    }
  })
}


function makeCounter(original: TestId[]) {
  let count = 0;
  return (results: TestId[]) => {
    count++;
    if (count % 10 == 0) {
      console.log(`Running test ${count} (failed ${results.length}) of ${original.length}`);
    }
    return count;
  }
}

