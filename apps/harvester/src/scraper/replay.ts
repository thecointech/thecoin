import currency from 'currency.js';
import { DateTime } from 'luxon';
import { ElementHandle, Page } from 'puppeteer';
import { startPuppeteer } from './puppeteer';
import { getTableData, HistoryRow } from './table';
import { AnyEvent, InputEvent, ClickEvent, ValueEvent, ActionTypes, ChequeBalanceResult, VisaBalanceResult, ReplayResult, ETransferResult } from './types';
import { CurrencyType, getCurrencyConverter } from './valueParsing';
import { getEvents } from '../Harvester/config';
import { log } from '@thecointech/logging';
import { debounce } from './debounce';
import path from 'path';
import { mkdirSync } from 'fs';
import { outFolder } from '../paths';


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function replay(actionName: 'chqBalance') : Promise<ChequeBalanceResult>;
export async function replay(actionName: 'visaBalance') : Promise<VisaBalanceResult>;
export async function replay(actionName: 'chqETransfer', dynamicValues: { amount: string }) : Promise<ETransferResult>;
export async function replay(actionName: ActionTypes, dynamicValues?: Record<string, string>, delay?: number) : Promise<ReplayResult>
export async function replay(actionName: ActionTypes, dynamicValues?: Record<string, string>, delay = 1000) {

  const { page, browser } = await startPuppeteer();

  const values: Record<string, string|DateTime|currency|HistoryRow[]> = {}

  // read events
  const events = await getEvents(actionName);
  log.debug(`Replaying ${actionName} with ${events?.length} events`);

  if (!events) {
    throw new Error(`No events found for ${actionName}`);
  }

  // Security: limit this session to a single domain.
  // TODO: This triggers on safe routes, disable until we have a better view
  // const firstNavigate = events.find(e => e.type == "navigation") as NavigationEvent;
  // const hostname = new URL(firstNavigate.to).hostname
  // await page.evaluateOnNewDocument((hostname) => {
  //   if (hostname  != window.location.hostname) {
  //     alert("WARNING: Replay appears to be leaving expected domain");
  //     debugger;
  //   };
  // }, hostname);

  const screenshotFolder = path.join(outFolder, actionName);
  mkdirSync(screenshotFolder, { recursive: true });
  const doSaveScreenshot = async (page: Page, fileName: string) => {
    const outfile = path.join(screenshotFolder, fileName);
    log.debug(`saving screenshot: ${outfile}`);
    const r = await page.screenshot({ path: outfile })
    log.debug(`Saved screenshot: (${r.length})`);
  }
  const saveScreenshot = debounce(doSaveScreenshot);


  async function getFrame(click: ClickEvent) {
    if (!click.frame) {
      return page;
    }
    // wait for any iframe to load
    // await page.waitForSelector('iframe')
    for (let i = 0; i < 20; i++) {
      const maybe = page.frames().find(f => f.name() == click.frame);
      if (maybe) return maybe;

      // back-off and retry
      await sleep(delay);
    }
    // return page.  Who knows, maybe it'll work?
    return page;
  }

  async function getClickElement(click: ClickEvent) {
    // first, navigate to the right iframe
    const frame = await getFrame(click);

    // Selectors suck, can we use something more robust?
    try {
      const el = await frame.waitForSelector(click.selector, { timeout: 5000 });
      if (el) return el;
    }
    catch (err) {
      log.error(`Couldn't find selector: ${click.selector}`)
      await doSaveScreenshot(page, `error-click-${actionName}-${click.tagName}.png`);
    }

    log.debug(`Searching for alternative ${click.tagName} elements`);

    try {
      function __mainlogger(msg: string) {
        log.debug(msg);
      }
      await page.exposeFunction('__mainlogger', __mainlogger);
    }
    catch (err) {
      log.error(`Couldn't expose logger: ${err}`);
    }


    // Else search for tag + text combo at location
    // const els = await frame.$x(`//${click.tagName}`);
    const els = await page.evaluate(click => {

      const getCoords = (elem: Element) => {
        const box = elem.getBoundingClientRect();
        return {
          top: box.top + window.pageYOffset,
          right: box.right + window.pageXOffset,
          bottom: box.bottom + window.pageYOffset,
          left: box.left + window.pageXOffset
        };
      }

      const getPositionSimilarity = (elem: Element) => {
        const elCoords = getCoords(elem);
        const tops = Math.abs(click.coords.top - elCoords.top)
        const rights = Math.abs(click.coords.right - elCoords.right)
        const bottoms = Math.abs(click.coords.bottom - elCoords.bottom)
        const lefts = Math.abs(click.coords.left - elCoords.left)
        return tops + rights + bottoms + lefts;
      }
      const els = document.getElementsByTagName(click.tagName);
      try {
        //@ts-ignore
        __mainlogger(`MAINLOGGER: found ${els?.length} elements of type ${click.tagName}`);
      }
      catch (err) {
        console.log(err);
      }

      return Array.from(els as HTMLCollectionOf<HTMLElement>)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore chrome-specific function
        .filter(el => el.checkVisibility({
          checkOpacity: true,  // Check CSS opacity property too
          checkVisibilityCSS: true // Check CSS visibility property too
        }))
        .map(el => ({
          innerText: el.innerText,
          element: el,
          box: el.getBoundingClientRect(),
          style: getComputedStyle(el),
          positionSimilarity: getPositionSimilarity(el),
        }))
    }, click);

    log.debug(`Found ${JSON.stringify(els)} potentially matching elements`)

    if (els) {
      const candidates = els
        .filter(el => el.innerText == click.text)
        .sort((a, b) => a.positionSimilarity - b.positionSimilarity);

      if (candidates[0]) {
        // TS looses track of the type when nested
        return candidates[0].element as unknown as ElementHandle<HTMLElement>;
      }
    }

    // Add additional logic here if the selector doesn't work
    throw new Error(`Element not found: ${click.selector}`);
  }

  async function getInputElement(input: InputEvent) {
    // Selectors suck, can we use something more robust?
    const el = await page.waitForSelector(input.selector, { timeout: 10000 });
    if (el) return el;
    throw new Error(`Element not found: ${input.selector}`);
  }

  const readValue = (event: ValueEvent) => page.evaluate((ev: ValueEvent) => {
      const getCoords = (elem: Element) => {
        const box = elem.getBoundingClientRect();
        return {
          top: box.top + window.pageYOffset,
          right: box.right + window.pageXOffset,
          bottom: box.bottom + window.pageYOffset,
          left: box.left + window.pageXOffset
        };
      }

      const getPositionSimilarity = (elem: Element) => {
        const elCoords = getCoords(elem);
        const tops = Math.abs(ev.coords.top - elCoords.top)
        const rights = Math.abs(ev.coords.right - elCoords.right)
        const bottoms = Math.abs(ev.coords.bottom - elCoords.bottom)
        const lefts = Math.abs(ev.coords.left - elCoords.left)
        return tops + rights + bottoms + lefts;
      }

      // First, test with selector
      const potentials = document.querySelectorAll(ev.selector);
      if (potentials.length == 1) {
        const maybe = potentials[0];
        if (maybe instanceof HTMLElement) {
          return maybe.innerText;
        }
      }
      // So... we can't rely on hierarchy cause websites are arseholes
      // instead of relying on hierarchy, we kinda need to use screenshot
      // + text reader to gather all elements & work from that instead...

      // get all $ money amounts
      const all = Array.from(document.getElementsByTagName("*")) as HTMLElement[];
      let amounts = all.filter(el =>
        el instanceof HTMLElement &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore (chrome-specific function) check is visible
        el.checkVisibility({
          checkOpacity: true,  // Check CSS opacity property too
          checkVisibilityCSS: true // Check CSS visibility property too
        }) &&
        // is $ amount
        el.innerText?.trim().match(/^\$[0-9, ]+\.\d{2}$/)
      ) as HTMLElement[]

      // Which amount is it?  First search for sibling

      const siblings = all.filter(el => el.innerText?.trim() === ev.siblingText);
      const sibling = siblings[siblings.length - 1]
      // If we have a sibling in the document, filter out unsuitable amounts
      if (sibling) {
        // Find the amounts in-line with it's sibling
        const rowcoords = getCoords(sibling);
        amounts = amounts.filter(el => {
          const amntCoords = getCoords(el);
          // Must be to the left
          if (rowcoords.right > amntCoords.left)
            return false;

          // Must be on the same level
          const rowAvgY = (rowcoords.bottom + rowcoords.top) / 2
          const amntAvgY = (amntCoords.bottom + amntCoords.top) / 2
          return Math.abs(rowAvgY - amntAvgY) < ((amntCoords.bottom - amntCoords.top) / 4)
        })
      }

      // Which of these $ amounts are closest to the one originally listed?
      amounts.sort((a, b) => getPositionSimilarity(a) - getPositionSimilarity(b));
      // Take the most similar one, return it's text
      return (amounts[0] as HTMLElement)?.innerText
    }, event)

  async function processInstructions(events: AnyEvent[]) {

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // Keep a slight delay on events, time is not a priority here
      await sleep(delay);
      switch(event.type) {
        case 'navigation': {
          log.debug('Waiting navigation');
          // Only directly navigate on the first item
          // The rest of the time all navigations
          // must be from clicking links etc
          if (i == 0) {
            await Promise.all([
              page.goto(event.to),
              page.waitForNavigation({ waitUntil: 'networkidle2' })
            ])
          }

          saveScreenshot(page, `replay-${i}.png`)
          break;
        }
        case 'click': {
          log.debug(`Clicking on: ${event.text}`);
          // If this click caused a navigation?
          const el = await getClickElement(event);
          if (events[i + 1]?.type == "navigation") {
            await Promise.all([
              el.click(),
              page.waitForNavigation({ waitUntil: 'networkidle2' })
            ])
          }
          else {
            await el.click();
          }
          break;
        }
        case 'input': {
          log.debug(`Entering value: ############## into ${event.selector}`);
          if (event.value) {
            // Is this a dynamic input?
            const value = event.dynamicName
              ? dynamicValues?.[event.dynamicName]
              : event.value;
            if (value === undefined) {
              throw new Error(`Dynamic value not supplied: ${event.dynamicName}`);
            }

            const el = await getInputElement(event);
            await el.focus();
            if (event.tagName == "INPUT") {
              // clear existing value
              await page.evaluate((el) => (el as HTMLInputElement).value = "", el)
              // Simulate typing to mimic input actions
              await page.keyboard.type(value, { delay: 20 });
            }
            else if (event.tagName == "SELECT") {
              await el.evaluate((v, value) => (v as HTMLSelectElement).value = value, value)
            }
          }
          break;
        }
        case 'value': {
          // The 15 second wait is to compensate for SPA
          // websites who don't have load/navigation events
          // (thanks again tangerine ya bastard!)
          if (event.parsing?.type == "table") {
            log.debug(`Reading table`);
            const tryReadTable = async () => {
              for (let i = 0; i < 15; i++) {
                try {
                  const value = await getTableData(page, event.font);
                  if (value.length > 0) {
                    values[event.name ?? 'defaultValue'] = value;
                    return true;
                  }
                }
                catch (e) {
                  log.error(`Couldn't read table: ${event.selector} - ${e}`);
                }
                await sleep(1000);
              }
              return false;
            }
            if (!await tryReadTable()) {
              // Couldn't read value
              throw new Error("Couldn't find table!")
            }
            // All good, continue
            break;
          } else {
            log.debug(`Reading value: ${event.selector}`);
            // The 15 second wait is to compensate for SPA
            // websites who don't have load/navigation events
            // (thanks again tangerine ya bastard!)
            const tryReadValue = async () => {
              for (let i = 0; i < 15; i++) {
                try {
                  const value = await readValue(event);
                  const parsed = parseValue(value, event);
                  if (parsed) {
                    values[event.name ?? 'defaultValue'] = parsed;
                    return true;
                  }
                }
                catch (e) {
                  log.error(`Couldn't read value: ${event.selector} - ${e}`);
                }
                await sleep(1000);
              }
              return false;
            }
            if (!await tryReadValue()) {
              // Couldn't read value
              throw new Error("Couldn't find value!")
            }
            // All good, continue
            break;
          }
        }
      }
    }
  }

  await processInstructions(events)

  // Wait for a second in case anyone is watching
  await sleep(3000);
  await browser.close();
  // remove history (personal info) from logged info (TODO: remove this line entirely)
  const { history, ...sanitize } = values;
  log.debug(`We got values: ${JSON.stringify({
    ...sanitize,
    history: `${(history as any)?.length } rows`
  })}`);

  return values;
}


function parseValue(value: string, event: ValueEvent) {
  if (value && event.parsing?.format) {
    switch(event.parsing?.type) {
      case "date": {
        const d = DateTime.fromFormat(value, event.parsing.format);
        if (d.isValid) return d;
        break;
      }
      case "currency": {
        const cvt = getCurrencyConverter(event.parsing.format as CurrencyType);
        return cvt(value);
      }
    }
  }
  return value;
}

