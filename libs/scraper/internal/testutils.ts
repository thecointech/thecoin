import { readFileSync } from "node:fs"
import { type Browser } from "puppeteer"
import { patchOnnxForJest } from "./jestPatch";
import { IsManualRun } from '@thecointech/jestutils';
import { cleanProfileLocks, newPage, setupScraper } from "../src/puppeteer-init";

export const testFileFolder = process.env.PRIVATE_TESTING_PAGES
export const getTestPage = (...parts: string[]) => `file:///${testFileFolder}/unit-tests/${parts.join('/')}`
export const getTestInfo = (...parts: string[]) => JSON.parse(
  readFileSync(`${testFileFolder}/unit-tests/${parts.join('/')}`, 'utf-8')
)
export { patchOnnxForJest } from "./jestPatch"
export { getTestData, hasTestingPages } from "./getTestData"
export * from "./testData"

setupScraper({
  rootFolder: './.cache/test',
  isVisible: async () => IsManualRun,
});

export function useTestBrowser() {
  cleanProfileLocks();

  let _browser: Browser|null = null;
  beforeAll(async () => {
    patchOnnxForJest();
  })

  afterAll(async () => {
    await _browser?.close();
  })

  const getPage = async () => {
    const { page, browser } = await newPage("default");
    page.setBypassCSP(true);
    _browser = browser;
    return page;
  }
  return { getPage }
}
