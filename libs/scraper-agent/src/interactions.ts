import type { SearchElement } from "@thecointech/scraper/types";
import { TimeoutError, type Page } from "puppeteer";
import { doPixelMatch, waitPageStable } from "@thecointech/scraper/utilities";
import { waitUntilLoadComplete } from "@thecointech/scraper/record/waitLoadComplete";
import { log } from "@thecointech/logging";
import { sleep } from "@thecointech/async";
import { _getPageIntent } from "./getPageIntent";

// Handle page interactions

// 50 * 50 = 2500 which is 0.1% of the viewport.  This is a pretty small area to detect a change in a page
const MIN_PIXELS_CHANGED = parseInt(process.env.SCRAPER_CLICK_MIN_PIXELS_CHANGED || "2500");
export async function clickElement(page: Page, element: SearchElement, noNavigate?: boolean, minPixelsChanged?: number) {
  if (!minPixelsChanged) {
    minPixelsChanged = MIN_PIXELS_CHANGED;
  }
  const before = await page.screenshot();

  // Shortcut - this is true IF AND ONLY IF there is no navigation from this click.
  // For example, clicking checkboxes & the "Accept Cookies" buttons.
  if (noNavigate) {
    const didChange = await clickElementCoords(page, before, element, minPixelsChanged);
    if (didChange) {
      await waitPageStable(page, 5000, minPixelsChanged);
      return true;
    }
    // If nothing changed, fallback to the navigation version
  }


  try {
    await triggerNavigateAndWait(page, () => clickElementDirectly(page, element));
    // If we clicked, we may have navigated but ended up on the same page
    // (eg, if an error message prevents us from proceeding)
    return await pageDidChange(page, before, minPixelsChanged);
  }
  catch (err) {
    if (err instanceof TimeoutError) {
      // If there was no navigation, let's check to see if the page has a significant update
      const viewport = page.viewport();
      // If 1% of the viewport have changed, we'll consider it a successful update
      const minSigPixels = 0.01 * viewport!.width * viewport!.height;
      if (await pageDidChange(page, before, minSigPixels)) {
        await waitPageStable(page);
        return true;
      }

      // If no update has happened, then the click probably failed.
      // Try clicking the spot directly and then wait for the page to be stable
      // This should catch the extremely rare case where an element click does not
      // trigger appropriate action because we've selected the wrong element.
      // (I Think this happens for BMO)
      log.debug(`No navigation triggered after clicking ${element.data.selector}, retrying`);
      const didChange = await clickElementCoords(page, before, element, minPixelsChanged);
      if (didChange) {
        await waitPageStable(page);
        return true;
      }
    }
    throw err;
  }
}

async function clickElementCoords(page: Page, before: Uint8Array, found: SearchElement, minPixelsChanged: number) {

  // Simulate a user clicking on the element
  const coords = found.data.coords;
  await page.mouse.click(coords.left + coords.width / 2, coords.centerY);
  // Give enough time for the page to update.  1s is just a guess
  await sleep(1000);
  return await pageDidChange(page, before, minPixelsChanged);
}

async function pageDidChange(page: Page, before: Uint8Array, minPixelsChanged: number) {
  const after = await page.screenshot();
  const changed = doPixelMatch(before, after);

  if (changed < minPixelsChanged) {
    // If nothing has changed, lets try a click at that location
    // This is because we may have picked up the wrong element
    // for capturing the click.  In this case, our fallback is to
    // click that location directly.  We don't do this from the
    // start because it seems to fail when clicking "Submit" in Tangerine
    log.debug(`Only ${changed} < ${minPixelsChanged} pixels changed when clicking`);
    return false;
  }
  return true;
}

async function clickElementDirectly(page: Page, found: SearchElement) {
  try {
    await found.element.click();
  }
  catch (err) {
    // We seem to be getting issues with clicking buttons:
    // https://github.com/puppeteer/puppeteer/issues/3496 suggests
    // using eval instead.
    try {
      await page.$eval(found.data.selector, (el) => (el as HTMLElement).click());
    }
    catch (err) {
      log.error(err, `Failed to click element: ${found.data.selector}`);
      throw err;
    }
  }
}

async function tryActionAndWait<T>(page: Page, trigger: () => Promise<T>) : Promise<T|null> {
  // Wrap the action in try/catch in case it does not actually trigger a navigation
  try {
    const r = await Promise.all([
      // This will timeout slowly if a navigation is triggered
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30_000 }),
      // This will timeout quickly if no navigation is triggered
      page.waitForRequest(req=> {
        return req.isNavigationRequest();
      }, { timeout: 5000 }),
      trigger(),
    ]);

    // Add another wait for any further changes...
    await waitUntilLoadComplete(page);

    // Don't log any arguments, they aren't helpf
    const minimalUrl = page.url().split("?")[0]
    log.info(`Navigated to: ${minimalUrl}`);
    return r[2];
  }
  catch (err) {
    if (err instanceof TimeoutError) {
      log.info(`Timed out waiting for navigation`);
      // Maybe there just was no navigation?  Continue and see what happens
      return null;
    }
    throw err;
  }
}

export async function triggerNavigateAndWait<T>(page: Page, trigger: () => Promise<T>) : Promise<T|null> {

  const r = await tryActionAndWait(page, trigger);
  // Post-navigation, wait until we have some sort of idea what the page is about
  await waitForValidIntent(page);
  // Even after we've got an intent, wait for loading animations to finish
  await waitPageStable(page);
  // Return whatever-this-is in case someone needs it someday
  return r;
}

const elapsedSeconds = (start: number) => {
  const elapsed = Date.now() - start;
  return (elapsed / 1000).toFixed(2);
}

// Polls the webpage and will wait until
export async function waitForValidIntent(page: Page, interval = 1000, timeout = 30_000) {
  const start = Date.now();
  const maxTime = start + timeout;
  do {
    try {
      const intent = await _getPageIntent(page);
      log.debug(`Waiting For Valid Intent: detected as type '${intent}'`);
      // If the page has some kind of intent, then we can stop
      if (intent != "Loading" && intent != "Blank") {
        log.info(`Detected intent: ${intent} after ${elapsedSeconds(start)} seconds`);
        return intent;
      }
    }
    catch (err) {
      log.warn(`Error occured while waiting for intent: ${err}`);
      //
    }
    await sleep(interval)
  } while (Date.now() < maxTime);
  log.error(`Valid intent not detected in ${timeout / 1000} seconds`);
  return null;
}
