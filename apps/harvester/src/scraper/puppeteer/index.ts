import puppeteerVanilla, { type Browser } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { getPlugins } from './plugins';
import { registerElementAttrFns } from '../elements';
import { getBrowserPath, getUserDataDir } from './browser';

const puppeteer = addExtra(puppeteerVanilla);
const plugins = getPlugins();

let _browser: Browser|undefined;
export async function startPuppeteer(headless?: boolean) {

  if (_browser) {
    return { browser: _browser, page: await _browser.newPage() };
  }

  const shouldBeHeadless = headless ?? process.env.RUN_SCRAPER_HEADLESS !== 'false';
  const browser = await puppeteer.launch({
    headless: shouldBeHeadless,
    executablePath: await getBrowserPath(),
    userDataDir: getUserDataDir()
    // After install this appears in the AppData directory
    // userDataDir,
    // ...(await getChromeParams())
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

  // Always inject helper functions
  await registerElementAttrFns(page);

  return { browser, page };
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
  }
}
