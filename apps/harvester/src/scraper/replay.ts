import currency from 'currency.js';
import { DateTime } from 'luxon';
import type { Page } from 'puppeteer';
import { startPuppeteer } from './puppeteer';
import { getTableData, HistoryRow } from './table';
import { AnyEvent, ValueEvent, ActionTypes, ChequeBalanceResult, VisaBalanceResult, ReplayResult, ETransferResult, ElementData } from './types';
import { CurrencyType, getCurrencyConverter } from './valueParsing';
import { getEvents } from '../Harvester/config';
import { log } from '@thecointech/logging';
import { debounce } from './debounce';
import path from 'path';
import { mkdirSync } from 'fs';
import { logsFolder, outFolder } from '../paths';
import { getElementForEvent } from './elements';
import { writeFileSync } from 'node:fs';


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type Replay = typeof replay;

export async function replay(actionName: 'chqBalance'): Promise<ChequeBalanceResult>;
export async function replay(actionName: 'visaBalance'): Promise<VisaBalanceResult>;
export async function replay(actionName: 'chqETransfer', dynamicValues: { amount: string }): Promise<ETransferResult>;
export async function replay(actionName: ActionTypes, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function replay(actionName: ActionTypes, dynamicValues?: Record<string, string>, delay = 1000) {
  // read events
  const events = await getEvents(actionName);
  log.debug(`Replaying ${actionName} with ${events?.length} events`);

  if (!events) {
    throw new Error(`No events found for ${actionName}`);
  }

  const { page, browser } = await startPuppeteer();

  try {
    const r = await replayEvents(page, actionName, events, dynamicValues, delay);
    return r;
  }
  catch (err) {
    const saveDump = process.env.HARVESTER_SAVE_DUMP;
    log.error(err, `Failed to replay ${actionName}, doing dump: ${saveDump ?? false}`);
    if (saveDump) {
      const now = DateTime.now();
      const dumpFolder = path.join(logsFolder, "dumps", `${now.toSQLDate()}-${actionName}`, now.toFormat("HH-mm-ss"));
      await dumpPage(page, dumpFolder);
    }
    throw err;
  }
  finally {
    await page.close();
    await browser.close();
  }
}

export async function replayEvents(page: Page, actionName: ActionTypes, events: AnyEvent[], dynamicValues?: Record<string, string>, delay = 1000) {

  const values: Record<string, string | DateTime | currency | HistoryRow[]> = {}

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
    await page.screenshot({ path: outfile })
  }
  const saveScreenshot = debounce(doSaveScreenshot);

  async function processInstructions(events: AnyEvent[]) {

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      log.info(` - Processing event: ${event.type} - ${event.id}`);
      // Keep a slight delay on events, time is not a priority here
      await sleep(delay);
      switch (event.type) {
        case 'navigation': {
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
          // If this click caused a navigation?
          const found = await getElementForEvent(page, event);
          const tryClicking = async () => {
            try {
              await found.element.click();
            }
            catch (err) {
              // We seem to be getting issues with clicking buttons:
              // https://github.com/puppeteer/puppeteer/issues/3496 suggests
              // using eval instead.
              log.debug(`Click failed, retrying on ${found.data.selector} - ${err}`);
              await page.$eval(found.data.selector, (el) => (el as HTMLElement).click())
            }
          }
          if (events[i + 1]?.type == "navigation") {
            await Promise.all([
              tryClicking(),
              page.waitForNavigation({ waitUntil: 'networkidle2' })
            ])
          }
          else {
            await tryClicking();
          }
          break;
        }
        case 'input': {
          await enterValue(page, event, event.value);

          // If the user pressed enter, simulate this too
          if (event.hitEnter) {
            if (events[i + 1]?.type == "navigation") {
              await Promise.all([
                page.keyboard.press('Enter'),
                page.waitForNavigation({ waitUntil: 'networkidle2' })
              ])
            }
            else {
              await page.keyboard.press('Enter');
            }
          }
          break;
        }
        case 'dynamicInput': {
          log.debug(`Entering dynamicValue : ${event.dynamicName} into ${event.selector}`);
          const value = dynamicValues?.[event.dynamicName];
          if (!value) {
            throw new Error(`Dynamic value not supplied: ${event.dynamicName}`);
          }

          await enterValue(page, event, value);
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
                  const value = await getTableData(page);
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
            log.debug({name: event.name}, `Reading value: {name}`);
            // The 15 second wait is to compensate for SPA
            // websites who don't have load/navigation events
            // (thanks again tangerine ya bastard!)
            const tryReadValue = async () => {
              for (let i = 0; i < 15; i++) {
                try {
                  const el = await getElementForEvent(page, event);
                  const parsed = parseValue(el.data.text, event);
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

  // remove history (personal info) from logged info (TODO: remove this line entirely)
  const { history, ...sanitize } = values;
  log.debug(`We got values: ${JSON.stringify({
    ...sanitize,
    history: `${(history as any)?.length ?? 0} rows`
  })}`);

  return values;
}


async function enterValue(page: Page, event: ElementData, value: string) {
  const { element } = await getElementForEvent(page, event);
  await element.focus();
  if (event.tagName == "INPUT" || event.tagName == "TEXTAREA") {
    // clear existing value
    await page.evaluate((el) => (el as HTMLInputElement).value = "", element);
    // Simulate typing to mimic input actions
    await page.keyboard.type(value, { delay: 20 });
  }
  else if (event.tagName == "SELECT") {
    await element.evaluate((v, value) => (v as HTMLSelectElement).value = value, value);
  }
}

function parseValue(value: string, event: ValueEvent) {
  if (value && event.parsing?.format) {
    switch (event.parsing?.type) {
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

export async function dumpPage(page: Page, dumpFolder: string) {
  mkdirSync(dumpFolder, { recursive: true });
  // Save screenshot
  await page.screenshot({ path: path.join(dumpFolder, `screenshot.png`) });
  // Save content
  const content = await page.content();
  writeFileSync(path.join(dumpFolder, `content.html`), content);
  // Lastly, try for MHTML
  const cdp = await page.target().createCDPSession();
  const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
  writeFileSync(path.join(dumpFolder, 'snapshot.mhtml'), data);
}
