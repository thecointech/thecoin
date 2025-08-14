import { jest } from "@jest/globals";
import { describe } from "@thecointech/jestutils"
import { getTestData, hasTestingPages } from "../internal/getTestData";
import { getElementForEvent } from "./elements";

jest.setTimeout(20 * 60 * 1000);

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
        console.log(e)
        throw e;
      }
    }
  })
}, hasTestingPages)


describe("It finds the same elements as before in archive", () => {

  // Find all element files.
  const testData = getTestData("*", "elm.json", "record-archive");

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
        if (found.data.text !== elm.text || found.data.selector !== elm.selector) {
          console.log(`Found ${found.data.text} ${found.data.selector}`)
          console.log(`Expected ${elm.text} ${elm.selector}`)
        }
        expect(found.data.text).toEqual(elm.text);
        expect(found.data.selector).toEqual(elm.selector)
      }
      catch(e) {
        console.log(e)
        throw e;
      }
    }
  })
}, hasTestingPages)
