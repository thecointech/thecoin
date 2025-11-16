import { getTestData, TestData, writeElementCache, saveSnapshot, writeLastFailing, type TestID } from "@thecointech/scraper-archive";
import { closeBrowser, newPage, setupScraper } from "../src/puppeteer-init";
import { gotoPage } from "./gotoPage";
import { getElementForEvent } from "../src/elements";
import type { FoundElement, ElementSearchParams } from "@thecointech/scraper-types";
import { getDocumentBounds } from "../src/elements";
import { log } from "@thecointech/logging";

// Parse command-line arguments
const args = process.argv.slice(2);
const doWriteSnapshot = args.includes('--snapshot');
const doUpdateCache = args.includes('--cache');

const getPage = async (url: string) => {
  const { page } = await newPage("default");
  await gotoPage(page, url);
  return page;
}
setupScraper({ rootFolder: "./.cache/test" });
// Don't log too much
log.level("warn");

const testData = getTestData("*", "elm.json", "archive", TestData, getPage);
const tests = testData.flatMap(t => t.names().map(e => ({ test: t, name: e })))
const timestamp = new Date();

console.log(`Processing ${tests.length} tests\n\t${doWriteSnapshot ? "writing snapshots" : "not writing snapshots"}\n\t${doUpdateCache ? "updating cache" : "not updating cache"}`);
const failed: TestID[] = [];
for (let i = 0; i < tests.length; i++) {
  const { test, name } = tests[i];
  if (i % 10 == 0 && i > 0) {
    console.log(`Processing ${i} of ${tests.length} (${failed.length} failed)`)
    const estTimeRemain = (Date.now() - timestamp.getTime()) / i * (tests.length - i);
    const estTimeRemainMessage = estTimeRemain > 60_000
      ? `${(estTimeRemain / 60_000).toFixed(2)} minutes`
      : `${(estTimeRemain / 1000).toFixed(2)} seconds`;
    console.log(`Estimated time remaining: ${estTimeRemainMessage}`)
  }

  const timer = setTimeout(() => {
    console.log(`Timeout for ${test.key} - ${name}`);
    failed.push({ key: test.key, name });
  }, 60_000);
  try {

    const page = await test.page();
    const sch = test.sch(name);
    const elm = test.elm(name);

    const onFound = async (candidate: FoundElement, _params: ElementSearchParams, candidates: FoundElement[]) => {
      // Write out the snapshot...
      if (doWriteSnapshot) {
        saveSnapshot(test, name, timestamp, elm, candidate, candidates);
      }
      if (doUpdateCache) {
        const bounds = await getDocumentBounds(page, sch.maxTop);
        writeElementCache(test, bounds, candidates);
      }
    }
    const found = await getElementForEvent({
      ...sch,
      page,
      timeout: 500
    }, onFound);
    if (found.data.selector != elm.data.selector) {
      throw new Error(`Found different selector for ${test.key} - ${name}`);
    }
  }
  catch (e) {
    console.error("Error in ", test.key, name, e);
    failed.push({ key: test.key, name });
  }
  finally {
    clearTimeout(timer);
  }
}

console.log("Failed: ", failed.length);
console.table(failed);
writeLastFailing(failed);

await closeBrowser();
