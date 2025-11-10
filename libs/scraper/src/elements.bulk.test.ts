import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData } from "../internal/getTestData";
import { getElementForEvent } from "./elements";
import { ElementNotFoundError } from "./errors";
import { type TestData, getLastFailing, hasTestingPages, saveSnapshot, shouldSkip, writeLastFailing } from "@thecointech/scraper-archive";
import type { ElementSearchParams, FoundElement } from "@thecointech/scraper-types";

jest.setTimeout(20 * 60 * 1000);
const MIN_ELEMENTS_IN_VALID_PAGE = 25;

describe("It finds the same elements as before in archive", () => {
  runTests();
}, hasTestingPages);

describe("It runs only the failing tests in archive", () => {
  runTests(getLastFailing());
}, IsManualRun)

function runTests(includeFilter?: string[]) {

  // Even if skipped above this function still runs to list the tests
  // We don't want hundreds of skipped tests to show up in our results, so return early
  if (!includeFilter && IsManualRun) {
    return;
  }
  const testData = getTestData("*", "elm.json", "archive");
  const currentlyFailing = new Set<string>();
  const results = [];
  const filteredTests = testData.filter(test => !shouldSkip(test, includeFilter));
  const allElements = filteredTests.flatMap(t => t.names().map(name => ({ test: t, name })))
  const [filteredElements, skippedElements] = allElements
    .reduce(([filtered, skipped], { test, name }) => {
      const sch = test.sch(name);
      if (sch?.event.estimated) {
        filtered.push({ testKey: test.key, test, name });
      }
      else {
        skipped.push(`${test.key} - ${name}`);
      }
      return [filtered, skipped];
    }, [[], []]);

  const timestamp = Date.now();

  console.log(`Found ${filteredElements.length} elements to test, skipping ${skippedElements.length}`);
  // Let us know how many elements we skipped
  it.skip.each(skippedElements)("non-vqa element: %s", (name) => {});

  const counter = makeCounter(filteredElements);
  it.each(filteredElements)("Finds the correct element: $testKey - $name", async ({ testKey, test, name }) => {
    counter(results);
    const page = await test.page();
    const sch = test.sch(name);
    const elm = test.elm(name);

    try {
      const onFound = async (candidate: FoundElement, _params: ElementSearchParams, candidates: FoundElement[]) => {
        // Write out the snapshot...
        saveSnapshot(test, name, timestamp, elm, candidate, candidates);
      }
      const found = await getElementForEvent({
        ...sch,
        page,
        timeout: 500
      }, onFound);

      expect(found.data.text).toEqual(elm.text);
      expect(found.data.selector).toEqual(elm.selector)
    }
    catch (e) {
      if (e instanceof ElementNotFoundError) {
        // Sometimes, mhtml is a wee bit bung
        const allElements = await page.$$("*")
        if (allElements.length < MIN_ELEMENTS_IN_VALID_PAGE) {
          console.error(`Element not found, but page is empty, check mhtml on ${test.key}`)
          return;
        }
      }
      currentlyFailing.add(test.key);
      throw e;
    }
  })

  afterAll(() => {
    writeLastFailing(currentlyFailing);
    console.table(results.map(r => ({ key: r.key, found: r.found.data.selector, expected: r.expected.selector })));
  })
}


function makeCounter(filtered: { test: TestData, element: string }[]) {
  let count = 0;
  return (results: any[]) => {
    count++;
    if (count % 10 == 0) {
      console.log(`Running test ${count} (failed ${results.length}) of ${filtered.length}`);
    }
    return count;
  }
}

