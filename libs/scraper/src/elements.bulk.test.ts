import { jest } from "@jest/globals";
import { describe } from "@thecointech/jestutils"
import { getTestData, hasTestingPages } from "../internal/getTestData";
import { getElementForEvent } from "./elements";
import { open, openSync, readFileSync, writeFile, writeFileSync } from "node:fs";
import { ElementNotFoundError } from "./errors";
import { log } from "@thecointech/logging";

jest.setTimeout(20 * 60 * 1000);
const MIN_ELEMENTS_IN_VALID_PAGE = 25;

describe("It finds the same elements as before in latest", () => {

  // Find all element files.
  const testData = getTestData("*", "elm.json");

  it.each(testData)("Finds the correct element: %s", async (test) => {
    // It's possible that the mhtml fails to write out
    // in these cases we cannot test searching
    if (!test.hasSnapshot()) {
      return;
    }

    const page = await test.page();
    const elements = test.elements();
    for (const element of elements) {
      const name = element.split("-elm")[0].substring(4);
      const sch = test.sch(name);
      const elm = test.elm(name);
      const expected = (elm as any).data ?? elm;
      const search = sch?.search ?? (elm as any).search;
      if (!search.event.estimated) {
        // Not a VQA search, ignore this.
        continue;
      }
      try {
        const found = await getElementForEvent({
          ...search,
          page,
          timeout: 500
        });
        expect(found.data.text).toEqual(expected.text);
        expect(found.data.selector).toEqual(expected.selector)
      }
      catch(e) {
        if (e instanceof ElementNotFoundError) {
          // Sometimes, mhtml is a wee bit bung
          const allElements = await page.$$("*")
          if (allElements.length < MIN_ELEMENTS_IN_VALID_PAGE) {
            log.error(`Element not found, but page is empty, check mhtml on ${test.key}`)
            break;
          }
        }
        throw e;
      }
    }
  })
}, hasTestingPages)


describe("It finds the same elements as before in archive", () => {

  // Find all element files.
  const testData = getTestData("*", "elm.json", "record-archive");

  // const overridePath = "/media/staylor/Shared Data/testing_pages/unit-tests/record-archive/overrides.json"
  // const overrideFile = readFileSync(overridePath, "utf-8");
  // const overridesAll: OverrideData = JSON.parse(overrideFile);
  // const overrides = overridesAll.overrides;

  const results = [];
  it.each(testData)("Finds the correct element: %s", async (test) => {
    // It's possible that the mhtml fails to write out
    // in these cases we cannot test searching
    if (!test.hasSnapshot()) {
      return;
    }

    if (test.key != "record-archive/record_gold/TD/TwoFA-0") {
      return;
    }

    const page = await test.page();
    const elements = test.elements();
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const name = element.match(/\d-(\D.+)-elm.json/)?.[1];
      const sch = test.sch(name);
      const elm = test.elm(name);
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
        // let writeOverride = true;
        if (found.data.text !== elm.text || found.data.selector !== elm.selector) {
          // if (writeOverride) {
          //   const testOverrides = overrides[test.key] = overrides[test.key] ?? {};
          //   const elementOverrides = testOverrides[name] = testOverrides[name] ?? [];
          //   const thisElementOverride: any = {};
          //   if (found.data.text !== elm.text) {
          //     thisElementOverride.text = found.data.text
          //   }
          //   if (found.data.selector !== elm.selector) {
          //     thisElementOverride.selector = found.data.selector
          //   }
          //   // Assume none exist yet...
          //   // The index is actually set by test.counter...
          //   elementOverrides.push(thisElementOverride);
          // }
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
            break;
          }
        }
        throw e;
      }

    }
  })

  afterAll(() => {
    // writeFileSync(overridePath, JSON.stringify(overridesAll, null, 2));
    console.table(results.map(r => ({ key: r.key, found: r.found.data.selector, expected: r.expected.selector })));
  })
}, hasTestingPages)
