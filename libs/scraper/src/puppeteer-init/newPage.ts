import puppeteerVanilla, { BrowserContext, Page, type Browser } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { getPlugins } from './plugins';
import { registerElementAttrFns } from '../elements';
import { getBrowserPath } from './browser';
import { log } from '@thecointech/logging';
import { cleanProfileLocks, getUserDataDir } from './userProfile';
import { getIsVisible } from './visibility';
import { getPuppeteerType } from './type';

const puppeteer = addExtra(puppeteerVanilla);
const plugins = getPlugins();

declare global {
  var __scraper__: {
    browser: Browser;
    contexts: Record<string, BrowserContext>;
  } | undefined;
}

async function getPage(contextName = "default") {

  // So... it seems that contexts are unusable because
  // they do not load cookies etc from default (thanks for
  // wasting my time Codieum ya bastard!)
  contextName = "default";

  if (globalThis.__scraper__) {
    const { browser, contexts } = globalThis.__scraper__;
    let context = contexts[contextName];
    if (!context) {
      log.debug(`Creating new context: ${contextName}`);
      context = await browser.createBrowserContext();
      contexts[contextName] = context;
    }
    else {
      log.debug(`Using existing context: ${contextName}`);
    }
    return { browser, page: await context.newPage() };
  }

  const type = getPuppeteerType();
  const executablePath = await getBrowserPath();
  const visible = await getIsVisible();
  const userDataDir = getUserDataDir();
  log.debug({ executablePath, visible, userDataDir }, "Starting Puppeteer: visible={visible}, exe={executablePath}, userDataDir={userDataDir}");
  const browser = await puppeteer.launch({
    headless: !visible,
    browser: type,
    executablePath,
    userDataDir,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      // TODO: Fix sandboxing on linux to resolve the following error in a better way
      // No usable sandbox! If you are running on Ubuntu 23.10+ or another
      // Linux distro that has disabled unprivileged user namespaces with AppArmor...
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--hide-scrollbars',

      // Disable automation detection features
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',

      // Make browser appear more like a normal user
      '--disable-infobars',
      '--disable-dev-shm-usage',

      // "--disable-accelerated-2d-canvas",
      // "--disable-gpu",
      // We can safely disable site isolation as
      // there is never more than a single site open
      // in the browser (and we only browse the banks
      // websites, which is explicitly trusted).
      // "--disable-site-isolation-trials"
    ],
  });

  if (type == "chrome") {
    for (const plugin of plugins) {
      await plugin.onBrowser(browser);
    }
  }

  let contexts: Record<string, BrowserContext> = {
    default: browser.defaultBrowserContext(),
  }
  if (contextName != "default") {
    contexts[contextName] = await browser.createBrowserContext();
  }
  const context = contexts[contextName]!;
  globalThis.__scraper__ = {
    browser,
    contexts,
  };

  browser.on('disconnected', () => {
    log.debug(" ** Browser disconnected");
    globalThis.__scraper__ = undefined
  });

  // On boot, close any existing pages.
  const [first, ...rest] = await context.pages();
  await closeAllPages(rest);
  const page = first ?? await context.newPage();
  // Navigate stale tabs to blank before handing off
  if (page.url() !== 'about:blank') {
    try {
      await page.goto('about:blank');
    } catch (e) {
      log.warn({ error: e }, 'Failed to navigate to about:blank');
    }
  }

  return {
    browser,
    page
  };
}

export async function newPage(contextName?: string) {

  const { page, browser } = await getPage(contextName);

  if (getPuppeteerType() == "chrome") {
    for (const plugin of plugins) {
      await plugin.onPageCreated(page);
    }
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
  // if (process.env.CONFIG_NAME?.startsWith('dev')) {
  //   initDebuggingInfo(page);
  // }

  return { page, browser };
}

export async function closeContext(contextName: string) {
  if (globalThis.__scraper__?.contexts[contextName]) {
    await globalThis.__scraper__.contexts[contextName].close();
    delete globalThis.__scraper__.contexts[contextName];
  }
}

export async function closeBrowser() {
  if (globalThis.__scraper__?.browser) {
    await globalThis.__scraper__.browser.close();
    globalThis.__scraper__ = undefined
  }
  // Force-delete singleton locks.  If the browser fails to close
  // for some reason, this will ensure the next run can start cleanly.
  await cleanProfileLocks();
}


async function closeAllPages(extraPages: Page[]) {
  const closeResults = await Promise.allSettled(extraPages.map(p => p.close()));
  closeResults.forEach((r, i) => {
    if (r.status === 'rejected') {
      log.warn({ error: r.reason }, `Failed to close extra page index=${i + 1}`);
    }
  });
}
