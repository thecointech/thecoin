import { type Browser } from "puppeteer"
import { patchOnnxForJest } from "./jestPatch";
import { IsManualRun } from '@thecointech/jestutils';
import { cleanProfileLocks, newPage, setupScraper } from "../src/puppeteer-init";
import { gotoPage } from "./gotoPage";

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

  const getPage = async (url: string) => {
    const { page, browser } = await newPage("default");
    _browser = browser;
    await gotoPage(page, url);
    return page;
  }
  return { getPage }
}
