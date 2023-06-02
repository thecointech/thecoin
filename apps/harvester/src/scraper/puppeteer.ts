import puppeteerVanilla, { executablePath } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { getPlugins } from './puppeteer-plugins';
import { rootFolder } from '../paths';
import path from "path";

const puppeteer = addExtra(puppeteerVanilla);
const plugins = getPlugins();
const userDataDir = path.join(rootFolder, 'chrome_data');

let _browser: any;
export async function startPuppeteer(headless?: boolean) {

  const shouldBeHeadless = headless ?? process.env.RUN_SCRAPER_HEADLESS !== 'false';
  const expath = executablePath();
  const browser = await puppeteer.launch({
    headless: shouldBeHeadless,
    executablePath: expath,
    // After install this appears in the AppData directory
    userDataDir,
  })

  for (const plugin of plugins) {
    await plugin.onBrowser(browser);
  }

  const [page] = await browser.pages();

  for (const plugin of plugins) {
    await plugin.onPageCreated(page);
  }

  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
  });
  _browser = browser;
  return { browser, page };
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
  }
}
