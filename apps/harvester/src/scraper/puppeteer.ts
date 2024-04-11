import puppeteerVanilla, { type Browser, executablePath } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { rootFolder } from '../paths';
import path from "path";
import { registerElementAttrFns } from './elements';
import StealthPlugins from 'puppeteer-extra-plugin-stealth';

// NOTE!  This is duplicated in harvester
// We should deduplicate to a single scraping package
const puppeteer = addExtra(puppeteerVanilla);
puppeteer.use(StealthPlugins());
const userDataDir = path.join(rootFolder, 'chrome_data');

let _browser: Browser | null = null;

export async function startPuppeteer(headless?: boolean) {

  const shouldBeHeadless = headless ?? process.env.RUN_SCRAPER_HEADLESS !== 'false';
  const expath = executablePath();
  const browser = await puppeteer.launch({
    headless: shouldBeHeadless,
    executablePath: expath,
    // After install this appears in the AppData directory
    userDataDir,
  })

  const [page] = await browser.pages();

  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
  });
  _browser = browser;

  // Always inject helper functions
  await registerElementAttrFns(page);

  return { browser, page };
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
  }
}
