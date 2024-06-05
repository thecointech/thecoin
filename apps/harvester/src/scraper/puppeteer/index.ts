import puppeteerVanilla, { type Browser } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { getPlugins } from './plugins';
import { registerElementAttrFns } from '../elements';
import { getBrowserPath, getUserDataDir } from './browser';
import { log } from '@thecointech/logging';

const puppeteer = addExtra(puppeteerVanilla);
const plugins = getPlugins();

let _browser: Browser|undefined;
export async function startPuppeteer(headless?: boolean) {

  if (_browser) {
    return { browser: _browser, page: await _browser.newPage() };
  }

  const executablePath = await getBrowserPath();
  log.debug(`Starting Puppeteer using executable path: ${executablePath}`);
  const shouldBeHeadless = headless ?? process.env.RUN_SCRAPER_HEADLESS !== 'false';
  const browser = await puppeteer.launch({
    headless: shouldBeHeadless,
    executablePath,
    userDataDir: getUserDataDir()
  });

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

  _browser.on('disconnected', () => {
    log.debug(" ** Browser disconnected");
    _browser = undefined
  });

  return { browser, page };
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
  }
}
