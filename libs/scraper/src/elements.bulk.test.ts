import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData, hasTestingPages } from "../internal/getTestData";
import { getElementForEvent } from "./elements";
import { writeFileSync } from "node:fs";
import { ElementNotFoundError } from "./errors";
import { log } from "@thecointech/logging";
import path from "node:path";
import { OverrideData } from "../internal/overrides";

jest.setTimeout(20 * 60 * 1000);
const MIN_ELEMENTS_IN_VALID_PAGE = 25;

describe("It finds the same elements as before in archive", () => {

  // Find all element files.
  const testData = getTestData("*", "elm.json", "archive");

  const overridePath = path.join(process.env.PRIVATE_TESTING_PAGES, "archive", `overrides-${Date.now()}.json`);
  const overrides: OverrideData = {
    skip: {},
    overrides: {},
  };
  const results = [];
  it.each(testData)("Finds the correct element: %s", async (test) => {
    // It's possible that the mhtml fails to write out
    // in these cases we cannot test searching
    if (!test.hasSnapshot()) {
      return;
    }
    if (!toCheck.includes(test.key)) {
      return;
    }
    console.log("Testing: ", test.key);

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
        throw e;
      }

    }
  })

  afterAll(() => {
    writeFileSync(overridePath, JSON.stringify(overrides, null, 2));
    console.table(results.map(r => ({ key: r.key, found: r.found.data.selector, expected: r.expected.selector })));
  })
}, hasTestingPages)


const toCheck = [
  'archive/2025-07-25_15-16/TD/TwoFA-0'
// "archive/2025-07-25_15-16/Tangerine/AccountsSummary-0",
// "archive/2025-07-25_15-16/TD/AccountsSummary-0",
// "archive/2025-07-25_15-16/RBC/AccountsSummary-0",
// "archive/2025-03-01/Tangerine/AccountsSummary-0",
// "archive/2025-03-01/TD/AccountsSummary-0",

  // "archive/2025-08-21_16-37/TD/AccountsSummary-0",
  // "archive/2025-07-25_15-16/TD/AccountsSummary-0",
  // "archive/2025-03-01/Tangerine/Logout-0",
  // "archive/2025-03-01/TD/SendETransfer-1",
]
