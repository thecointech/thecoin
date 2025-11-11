import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils"
import { getTestData } from "../internal/getTestData";
import { scoreAllCandidates } from "./elements";
import { getLastFailing, hasTestingPages, readElementCache, shouldSkip } from "@thecointech/scraper-archive";

jest.setTimeout(20 * 60 * 1000);

describe("It scores the correct element the highest in archive", () => {
  runTests();
}, hasTestingPages);

describe("It scores the correct element the highest in archive (only the failing tests)", () => {
  runTests(getLastFailing());
}, IsManualRun)

function runTests(includeFilter?: string[]) {

  // Even if skipped above this function still runs to list the tests
  // We don't want hundreds of skipped tests to show up in our results, so return early
  if (!includeFilter && IsManualRun) {
    return;
  }
  const testData = getTestData("*", "elm.json", "archive");
  const filteredTests = testData.filter(test => !shouldSkip(test, includeFilter));
  const allElements = filteredTests
    .flatMap(test => test.names().map(name => {
      return { test, name };
    }))
  it.each(allElements)("Writes out the elements", async ({ test, name }) => {
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
