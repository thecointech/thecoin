import puppeteerVanilla, { executablePath } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { getPlugins } from './puppeteer-plugins';

const puppeteer = addExtra(puppeteerVanilla);
const plugins = getPlugins();

export async function startPuppeteer(headless?: boolean) {

  const shouldBeHeadless = headless ?? process.env.RUN_SCRAPER_HEADLESS !== 'false';
  const expath = executablePath();
  const browser = await puppeteer.launch({
    headless: shouldBeHeadless,
    executablePath: expath,
    // After install this appears in the AppData directory
    userDataDir: './myChromeSession'
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
  return { browser, page };
}
