import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData } from "../internal/getTestData";
import { getDocumentBounds, getElementForEvent } from "./elements";
import { ElementNotFoundError } from "./errors";
import { type TestData, getLastFailing, hasTestingPages, saveSnapshot, writeLastFailing } from "@thecointech/scraper-archive";
import type { ElementSearchParams, FoundElement } from "@thecointech/scraper-types";
import { write } from "fs";

jest.setTimeout(20 * 60 * 1000);
const MIN_ELEMENTS_IN_VALID_PAGE = 25;

describe("It finds the same elements as before in archive", () => {
  if (IsManualRun) {
    return;
  }
  const testData = getTestData("*", "elm.json", "archive");
  const tests = testData.flatMap(t => t.elements().map(e => ({ testKey: t.key, test: t, name: e })))
  runTests(tests);
}, hasTestingPages);

describe("It runs only the failing tests in archive", () => {
  const testData = getTestData("*", "elm.json", "archive");
  const failing = testData.flatMap(t => t.failing.map(f => ({ testKey: t.key, test: t, name: f })))
  runTests(failing);
}, IsManualRun)

function runTests(tests: { testKey: string, test: TestData, name: string }[]) {
  const results: { testKey: string, test: TestData, name: string, found: FoundElement, expected: FoundElement }[] = [];
  const timestamp = new Date();

  console.log(`Found ${tests.length} elements to test`);

  const counter = makeCounter(tests);
  it.each(tests)("Finds the correct element: $testKey - $name", async ({ testKey, test, name }) => {
    counter(results);
    try {
      const page = await test.page();
      const sch = test.sch(name);
      const elm = test.elm(name);

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
      throw e;
    }
  })

  afterAll(() => {
    console.table(results.map(r => ({ key: r.testKey, name: r.name, found: r.found.data.selector, expected: r.expected.data.selector })));
  })
}


function makeCounter(filtered: { testKey: string, test: TestData, name: string }[]) {
  let count = 0;
  return (results: any[]) => {
    count++;
    if (count % 10 == 0) {
      console.log(`Running test ${count} (failed ${results.length}) of ${filtered.length}`);
    }
    return count;
  }
}

