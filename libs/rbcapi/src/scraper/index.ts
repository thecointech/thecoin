import puppeteerVanilla, { type Browser, executablePath } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { mkdirSync } from 'node:fs';
import StealthPlugins from 'puppeteer-extra-plugin-stealth';

// NOTE!  This is duplicated in harvester
// We should deduplicate to a single scraping package
const puppeteer = addExtra(puppeteerVanilla);
puppeteer.use(StealthPlugins());

let _browser: Browser | null = null;

export async function startPuppeteer() {

  const userDataDir = getUserDataDir();
  mkdirSync(userDataDir, { recursive: true });

  const expath = executablePath();
  const browser = await puppeteer.launch({
    headless: process.env.RUN_SCRAPER_HEADLESS !== 'false',
    executablePath: expath,
    // After install this appears in the AppData directory
    userDataDir,
  })

  return browser;
}

function getUserDataDir() {
    // Get the cache path for the browser user
    if (process.env.TC_LOG_FOLDER) {
      const base = process.env.TC_LOG_FOLDER;
      return `${base}/rbcapi/chromeSession`;
    }
    return './rbcChromeSession'
}

async function getNewPage() {
  if (!_browser) {
    _browser = await startPuppeteer();
    // On first start, just return the default page
    const [page] = await _browser.pages();
    return page;
  }
  else {
    // Subsequent start, create new page
    return _browser.newPage();
  }
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}

export async function getPage() {
  const page = await getNewPage();

  // setup for constant dimensions
  // for (const plugin of plugins) {
  //   await plugin.onPageCreated(page);
  // }

  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
  });
  return page;
}
