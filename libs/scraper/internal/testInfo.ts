import { readFileSync } from "node:fs"
import puppeteer, { type Browser } from "puppeteer"
import { patchOnnxForJest } from "./jestPatch";
import { registerElementAttrFns } from "../src/elements";

export const testFileFolder = process.env.PRIVATE_TESTING_PAGES
export const getTestPage = (type: string, name: string) => `file:///${testFileFolder}/${type}/${name}`
export const getTestInfo = (type: string, name: string) => JSON.parse(
  readFileSync(`${testFileFolder}/${type}/${name}`, 'utf-8')
)

export function useTestBrowser() {
  let browser: Browser|null = null;
  beforeAll(async () => {
    patchOnnxForJest();
  })

  afterAll(async () => {
    await browser?.close();
  })

  const getPage = async () => {
    browser ??= await puppeteer.launch({ headless: false });
    const page = await browser.newPage()
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await registerElementAttrFns(page);
    page.setBypassCSP(true);
    return page;
  }
  return { getPage, browser }
}
