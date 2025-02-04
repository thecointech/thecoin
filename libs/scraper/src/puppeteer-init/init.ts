import puppeteerVanilla, { type Browser } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { getPlugins } from './plugins';
import { registerElementAttrFns } from '../elements';
import { getBrowserPath, getUserDataDir } from './browser';
import { log } from '@thecointech/logging';

const puppeteer = addExtra(puppeteerVanilla);
const plugins = getPlugins();

let _browser: Browser|undefined;
async function getPage(headless?: boolean) {

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

  _browser = browser;

  _browser.on('disconnected', () => {
    log.debug(" ** Browser disconnected");
    _browser = undefined
  });

  // On boot, return the default (blank) page
  const [page] = await browser.pages();
  return { browser, page };
}

export async function newPage(headless?: boolean) {

  const { page, browser } = await getPage(headless);

  for (const plugin of plugins) {
    await plugin.onPageCreated(page);
  }

  await page.setViewport({
    width: 1280,
    // 720 x 2, because sometimes important info gets pushed beneath the fold
    // and some sites don't won't take full screenshots properly
    // (eg with warnings/messages at the top of the page)
    // height: 1440,
    height: parseInt(process.env.PUPPETEER_SCREENSHOT_HEIGHT || '1080'),
    deviceScaleFactor: 1,
  });

  // Always inject helper functions
  await registerElementAttrFns(page);

  return { page, browser };
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = undefined
  }
}
