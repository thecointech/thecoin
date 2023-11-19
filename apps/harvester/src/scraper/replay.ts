import currency from 'currency.js';
import { DateTime } from 'luxon';
import type { Page } from 'puppeteer';
import { startPuppeteer } from './puppeteer';
import { getTableData, HistoryRow } from './table';
import { AnyEvent, ValueEvent, ActionTypes, ChequeBalanceResult, VisaBalanceResult, ReplayResult, ETransferResult } from './types';
import { CurrencyType, getCurrencyConverter } from './valueParsing';
import { getEvents } from '../Harvester/config';
import { log } from '@thecointech/logging';
import { debounce } from './debounce';
import path from 'path';
import { mkdirSync } from 'fs';
import { outFolder } from '../paths';
import { getElementForEvent } from './elements';


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type Replay = typeof replay;

export async function replay(actionName: 'chqBalance') : Promise<ChequeBalanceResult>;
export async function replay(actionName: 'visaBalance') : Promise<VisaBalanceResult>;
export async function replay(actionName: 'chqETransfer', dynamicValues: { amount: string }) : Promise<ETransferResult>;
export async function replay(actionName: ActionTypes, dynamicValues?: Record<string, string>, delay?: number) : Promise<ReplayResult>
export async function replay(actionName: ActionTypes, dynamicValues?: Record<string, string>, delay = 1000) {
  // read events
  const events = await getEvents(actionName);
  log.debug(`Replaying ${actionName} with ${events?.length} events`);

  if (!events) {
    throw new Error(`No events found for ${actionName}`);
  }

  return await replayEvents(actionName, events, dynamicValues, delay);
}

export async function replayEvents(actionName: ActionTypes, events: AnyEvent[], dynamicValues?: Record<string, string>, delay = 1000) {

  const { page, browser } = await startPuppeteer();

  const values: Record<string, string|DateTime|currency|HistoryRow[]> = {}

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
          const {element} = await getElementForEvent(page, event);
          if (events[i + 1]?.type == "navigation") {
            await Promise.all([
              element.click(),
              page.waitForNavigation({ waitUntil: 'networkidle2' })
            ])
          }
          else {
            await element.click();
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

            const {element} = await getElementForEvent(page, event);
            await element.focus();
            if (event.tagName == "INPUT" || event.tagName == "TEXTAREA") {
              // clear existing value
              await page.evaluate((el) => (el as HTMLInputElement).value = "", element)
              // Simulate typing to mimic input actions
              await page.keyboard.type(value, { delay: 20 });
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
            }
            else if (event.tagName == "SELECT") {
              await element.evaluate((v, value) => (v as HTMLSelectElement).value = value, value)
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

