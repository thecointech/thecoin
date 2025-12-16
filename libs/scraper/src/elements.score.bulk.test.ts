import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData } from "../internal/getTestData";
import { scoreAllCandidates } from "./elements";
import { hasTestingPages, readElementCache, TestData } from "@thecointech/scraper-archive";

jest.setTimeout(20 * 60 * 1000);

describe("It scores the correct element the highest in archive", () => {
  const testData = getTestData("*", "elm.json", "archive");
  const tests = testData.flatMap(t => t.names().map(e => ({ testKey: t.key, test: t, name: e })))
  runTests(tests);
}, hasTestingPages());

describe("It scores the correct element the highest in archive (only the failing tests)", () => {
  const testData = getTestData("*", "elm.json", "archive");
  const failing = testData.flatMap(t => t.failing.map(f => ({ testKey: t.key, test: t, name: f })))
  runTests(failing);
}, hasTestingPages() && IsManualRun)

function runTests(tests: { testKey: string, test: TestData, name: string }[]) {

  console.log(`Found ${tests.length} elements to test`);
  const counter = makeCounter(tests.length);
  it.each(tests)("Finds the same element as before (cache-only) $testKey - $name", async ({ test, name }) => {
    counter.start();
    const sch = test.sch(name);
    const elm = test.elm(name);
    try {
      expect(elm).toBeDefined();
      expect(sch).toBeDefined();

      const cache = readElementCache(test);
      if (!cache) {
        throw new Error("No cache found for " + test.key);
      }
      const candidates = cache.candidates.map(c => ({ data: c }));
      const scoredElements = await scoreAllCandidates(candidates, sch.event, cache.bounds);
      const sorted = scoredElements.sort((a, b) => b.score - a.score);
      const found = sorted[0];
      expect(found.data.text).toEqual(elm.data.text);
      expect(found.data.selector).toEqual(elm.data.selector);
    }
    catch (e) {
      console.error(e);
      throw e;
    }
    finally {
      counter.end();
    }
  })
}

function makeCounter(original: number) {
  let count = 0;
  let successful = 0;
  const start = Date.now();
  return {
    start: () => {
      const elapsed = (Date.now() - start) / 1000;
      const avg = elapsed / count;
      count++;
      if (count % 10 == 0) {
        console.log(`Running test ${count} (failed ${(count - successful)}) of ${original} (${avg.toFixed(2)}s/test)`);
      }
    },
    end: () => {
      successful++;
    }
  }
}
