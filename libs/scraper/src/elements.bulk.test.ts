import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData, hasTestingPages } from "../internal/getTestData";
import { getElementForEvent } from "./elements";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ElementNotFoundError } from "./errors";
import { log } from "@thecointech/logging";
import path from "node:path";
import { OverrideData } from "../internal/overrides";
import { TestData } from "../internal/testData";

jest.setTimeout(20 * 60 * 1000);
const MIN_ELEMENTS_IN_VALID_PAGE = 25;

describe("It finds the same elements as before in archive", runTests, hasTestingPages);

describe("It runs only the failing tests in archive", () => {
  runTests(getLastFailing());
}, IsManualRun)

function runTests(includeFilter?: IncludeFilter) {
  const testData = getTestData("*", "elm.json", "archive");
  const overrides = initOverrides();
  const currentlyFailing = new Set<string>();
  const results = [];
  const filtered = testData.filter(test => !shouldSkip(test, includeFilter));
  const counter = makeCounter(filtered);
  it.each(filtered)("Finds the correct element: %s", async (test) => {
    counter();
    const page = await test.page();
    const elements = test.elements();
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const name = element.match(/(.+)-elm.json/)?.[1];
      const sch = test.sch(name);
      const elm = test.elm(name);
      if (!sch) {
        // console.error("No schema for ", test.key, name);
        const skipElements = overrides.skip[test.key] ?? {
          reason: "No schema",
          elements: [],
        };
        skipElements.elements.push(name);
        overrides.skip[test.key] = skipElements;
        continue;
      }
      if (!sch?.search.event.estimated) {
        // Not a VQA search, ignore this.
        continue;
      }
      try {
        const found = await getElementForEvent({
          ...sch.search,
          page,
          timeout: 500
        });
        let writeOverride = true;
        if (found.data.text !== elm.text || found.data.selector !== elm.selector) {
          if (writeOverride) {
            const testOverrides = overrides[test.key] = overrides[test.key] ?? {};
            const elementOverride = testOverrides[name] = testOverrides[name] ?? {};
            if (found.data.text !== elm.text) {
              elementOverride.text = found.data.text;
              elementOverride.coords = found.data.coords;
            }
            if (found.data.selector !== elm.selector) {
              elementOverride.selector = found.data.selector;
              elementOverride.coords = found.data.coords;
            }
          }
          results.push({
            key: test.key,
            found,
            expected: elm,
          })
        }
        expect(found.data.text).toEqual(elm.text);
        expect(found.data.selector).toEqual(elm.selector)
      }
      catch (e) {
        if (e instanceof ElementNotFoundError) {
          // Sometimes, mhtml is a wee bit bung
          const allElements = await page.$$("*")
          if (allElements.length < MIN_ELEMENTS_IN_VALID_PAGE) {
            log.error(`Element not found, but page is empty, check mhtml on ${test.key}`)
            overrides.skip[test.key] = {
              reason: "Page is empty",
            };
            break;
          }
        }
        currentlyFailing.add(test.key);
        throw e;
      }

    }
  })

  afterAll(() => {
    const overridePath = path.join(process.env.PRIVATE_TESTING_PAGES, "archive", `overrides-${Date.now()}.json`);
    writeFileSync(overridePath, JSON.stringify(overrides, null, 2));
    writeLastFailing(currentlyFailing);
    console.table(results.map(r => ({ key: r.key, found: r.found.data.selector, expected: r.expected.selector })));
  })
}

// Simple helper functions

type IncludeFilter = {
  exclude: string[];
  include: string[];
}
function getLastFailing(): IncludeFilter | null {
  if (existsSync(lastFailingFile())) {
    return JSON.parse(readFileSync(lastFailingFile(), "utf-8"));
  }
  return null;
}

function writeLastFailing(failing: Set<string>) {
  writeFileSync(lastFailingFile(), JSON.stringify({
    include: Array.from(failing),
    exclude: [],
  }, null, 2));
}

function shouldSkip(test: TestData, includeFilter?: IncludeFilter) {
  // If missing data, just skip
  if (!test.hasSnapshot() || test.searches().length == 0) {
    return true;
  }
  if (includeFilter) {
    return (
      !includeFilter.include.includes(test.key) ||
      includeFilter.exclude.includes(test.key)
    );
  }
  return false
}

function initOverrides(): OverrideData {
  return {
    skip: {},
    overrides: {},
  }
}

function lastFailingFile() {
  return path.join(process.env.PRIVATE_TESTING_PAGES, "archive", `failing-elm.json`);
}

function makeCounter(filtered: TestData[]) {
  let count = 0;
  return () => {
    count++;
    if (count % 10 == 0) {
      console.log(`Running test ${count} of ${filtered.length}`);
    }
    return count;
  }
}


