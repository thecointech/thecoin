import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData } from "../internal/getTestData";
import { scoreAllCandidates } from "./elements";
import { getLastFailing, hasTestingPages, readElementCache, TestData } from "@thecointech/scraper-archive";

jest.setTimeout(20 * 60 * 1000);

describe("It scores the correct element the highest in archive", () => {
  if (IsManualRun) {
    return;
  }
  const testData = getTestData("*", "elm.json", "archive");
  const tests = testData.flatMap(t => t.elements().map(e => ({ testKey: t.key, test: t, name: e })))
  runTests(tests);
}, hasTestingPages);

describe("It scores the correct element the highest in archive (only the failing tests)", () => {
  const testData = getTestData("*", "elm.json", "archive");
  const failing = testData.flatMap(t => t.failing.map(f => ({ testKey: t.key, test: t, name: f })))
  runTests(failing);
}, IsManualRun)

function runTests(tests: { testKey: string, test: TestData, name: string }[]) {

  it.each(tests)("Finds the same element as before (cache-only) $testKey - $name", async ({ test, name }) => {
    const sch = test.sch(name);
    const elm = test.elm(name);
    if (!sch) return;

    const cache = readElementCache(test);
    if (!cache) {
      throw new Error("No cache found for " + test.key);
    }
    const candidates = cache.candidates.map(c => ({ data: c }));
    const scoredElements = await scoreAllCandidates(candidates, sch.event, cache.bounds);
    const sorted = scoredElements.sort((a, b) => b.score - a.score);
    const best = sorted[0];
    expect(best.data.text).toEqual(elm.data.text);
    expect(best.data.selector).toEqual(elm.data.selector);
  })
}
