import type { AccountResponse, ElementResponse, InputElementResponse, MoneyElementResponse } from "@thecointech/vqa";
import type { ElementDataMin, FoundElement, SearchElement } from "@thecointech/scraper/types";
import { TimeoutError, type Page } from "puppeteer";
import { getElementForEvent } from "@thecointech/scraper/elements";
import pixelmatch from "pixelmatch";
import { log } from "@thecointech/logging";
import { sleep } from "@thecointech/async";
import { isPresent } from "@thecointech/utilities/ArrayExtns";
import { PNG } from "pngjs";
import { _getPageIntent } from "./getPageIntent";

export type AnyResponse = ElementResponse | InputElementResponse | MoneyElementResponse;

export function responseToElementData(response: AnyResponse, htmlType?: string, inputType?: string): ElementDataMin {
  const text = getContent(response);
  const width = text.length * 8;
  const height = 20; // Just guess based on avg font size
  return {
    estimated: true,
    tagName: htmlType?.toUpperCase(),
    inputType: inputType?.toLowerCase(),
    text,
    // We use a specific text-text scorer, so do not duplicate with nodeValue as that
    // may skew results and overpower the tagName/inputType scores
    // nodeValue: text,
    label: text,
    // Include original text in neighbour text, LLM isn't known for being precise
    siblingText: [getNeighbourText(response), text].filter(isPresent),
    coords: {
      top: response.position_y! - height / 2,
      left: response.position_x! - width / 2,
      height,
      width,
      centerY: response.position_y!,
    },
  };
}


export const accountToElementResponse = (account: AccountResponse) => ({
  position_x: account.position_x,
  position_y: account.position_y,
  background_color: "#f0f0f0",
  font_color: "#000000",
  neighbour_text: `${account.account_type}, ${account.balance}`,
  content: `${account.account_type} ${account.account_name} ${account.account_number} ${account.balance}`,
});


export async function responseToElement(page: Page, e: AnyResponse, htmlType?: string, inputType?: string, timeout?: number): Promise<FoundElement> {
  // Try to find and click the close button
  const elementData = responseToElementData(e, htmlType, inputType);

  const maxHeight = page.viewport()!.height + 100;
  // We have a lower minScore because the only data we have is text + position + neighbours
  // Which has a maximum value of 40 (text) + 20 (position) + 20 (neighbours)
  // So basically, if there is even one things matches, then it's good enough,
  return await getElementForEvent(page, elementData, timeout ?? 5000, 20, maxHeight);
}

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
      return true;
    }
    // If nothing changed, fallback to the navigation version
  }


  try {
    await triggerNavigateAndWait(page, () => clickElementDirectly(page, element));
    return true;
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
  await sleep(500);
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
    log.info(`Navigated to: ${page.url()}`);
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
  // Even after we've got an intent, wait for animations to finish
  await waitPageStable(page);
  // Return whatever-this-is in case someone needs it someday
  return r;
}

const elapsedSeconds = (start: number) => {
  const elapsed = Date.now() - start;
  return (elapsed / 1000).toFixed(2);
}

// Polls the webpage and will wait until
async function waitForValidIntent(page: Page, interval = 1000, timeout = 30_000) {
  const start = Date.now();
  const maxTime = start + timeout;
  do {
    try {
      const intent = await _getPageIntent(page);
      log.debug(`Waiting For Valid Intent: detected as type '${intent}'`);
      // If the page has some kind of intent, then we can stop
      if (intent != "Loading" && intent != "Blank") {
        log.info(`Detected intent: ${intent} after ${elapsedSeconds(start)} seconds`);
        return;
      }
    }
    catch (err) {
      log.warn(`Error occured while waiting for intent: ${err}`);
      //
    }
    await sleep(interval)
  } while (Date.now() < maxTime);
  log.error(`Valid intent not detected in ${timeout / 1000} seconds`);
}

async function waitPageStable(page: Page, timeout: number = 10_000) {
  let before = await page.screenshot();
  const start = Date.now();
  const maxTime = start + timeout;
  do {
    await sleep(500);
    const after = await page.screenshot();
    const changed = doPixelMatch(before, after);
    // This changed test sticks to the default has-the-page-changed value
    // for minPixelsChanged because we don't want to hang up page stability
    // on small changes
    if (changed < MIN_PIXELS_CHANGED) {
      log.debug(`Page stable,Only ${changed} < ${MIN_PIXELS_CHANGED} pixels changed after ${elapsedSeconds(start)} seconds`);
      return;
    }
    before = after;
  } while (Date.now() < maxTime);

  log.error(`Page has not been stable for ${timeout / 1000} seconds`);
  throw new TimeoutError("Timed out waiting for page to be stable");
}

export function doPixelMatch(before: Uint8Array|ArrayBuffer, after: Uint8Array|ArrayBuffer) {
  const img1 = PNG.sync.read(Buffer.from(before));
  const img2 = PNG.sync.read(Buffer.from(after));
  // With different size images, we cannot compute similarity so just say they are different
  if (img1.width != img2.width || img1.height != img2.height) {
    return img1.width * img1.height;
  }
  return pixelmatch(img1.data, img2.data, null, img1.width, img1.height);
}

function getContent(r: AnyResponse) {
  if ("content" in r) {
    return r.content;
  }
  else if ("placeholder_text" in r) {
    return r.placeholder_text ?? "";
  }
  return "";
}

function getNeighbourText(r: AnyResponse) {
  if ("neighbour_text" in r) {
    return r.neighbour_text;
  }
  return undefined;
}

