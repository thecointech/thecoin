import type { Page } from 'puppeteer';
import { getTableData } from './table';
import type { AnyEvent, SearchElement, AnyElementEvent } from '@thecointech/scraper-types';
import { parseValue } from '../valueParsing';
import { log } from '@thecointech/logging';
import { getElementForEvent } from '../elements';
import { sleep } from '@thecointech/async';
import { newPage } from '../puppeteer-init';
import type { Replay, ReplayOptions } from './types';
import { DynamicValueError, ValueEventError } from '../errors';
export type * from './types'


export async function replay(options: ReplayOptions) {

  log.debug(`Replaying ${options.events?.length} events`);

  // Progress started
  options.callbacks?.onProgress?.({ step: 0, total: 1, stage: options.name, stepPercent: 0 });

  const { page, browser } = await newPage(options.name);

  const replay: Replay = {
    ...options,
    page,
    values: {},
  };

  try {
    const r = await replayEvents(replay);
    return r;
  }
  finally {
    await page.close();
    await browser.close();
  }
}

export async function replayEvents(replay: Replay) {


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

  await processEvents(replay);

  log.debug(`-- Replay completed`);

  return replay.values;
}

export async function processEvents(replay: Replay) {
  for (let i = 0; i < replay.events.length; i++) {
    const event = replay.events[i];

    try {
      const eventNavigates = () => {
        return i == 0 || (
          event.type != "navigation" &&
          replay.events[i+1].type == "navigation"
        );
      }
      await processEvent(replay, event, eventNavigates);
    }
    catch (err) {
      // On failed, lets check whats going on
      log.error(err, `Failed to process event: ${event.type} - ${event.id}`);

      // attempt to handle the error
      const wasHandled = await replay.callbacks?.onError?.(
        { replay, err, event }
      );
      if (wasHandled === undefined) {
        throw err;
      }
      else {
        log.info(` - Error handled, index ${i} updated to ${wasHandled}`);
        // Decrement the index.  When this loop continues,
        // the i++ will move back to the index returned
        i = wasHandled - 1;
      }
    }

    const stepPercent = Math.round(100 * (i + 1) / replay.events.length);
    const continueLoop = replay.callbacks?.onProgress?.({ step: 0, total: 1, stage: replay.name, stepPercent, event });
    if (continueLoop === false) {
      break;
    }
  }
}

export async function processEvent({ page, dynamicValues, values, delay=1000 }: Replay, event: AnyEvent, eventNavigates: () => boolean) {
  log.info(` - Processing event: ${event.type} - ${event.id}`);

  // Keep a slight delay on events, time is not a priority here
  await sleep(delay);
  switch (event.type) {
    case 'navigation': {
      // Only directly navigate on the first item
      // The rest of the time all navigations
      // must be from clicking links etc
      if (eventNavigates()) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          page.goto(event.to),
        ])
      }
      break;
    }
    case 'click': {
      // If this click caused a navigation?
      const found = await getElementForEvent({ page, event });

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
      if (eventNavigates()) {
        await Promise.all([
          tryClicking(),
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
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
        if (eventNavigates()) {
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
      log.debug(`Entering dynamicValue : ${event.eventName} into ${event.selector}`);
      const value = dynamicValues?.[event.eventName];
      if (!value) {
        throw new DynamicValueError(event, dynamicValues);
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
          throw new ValueEventError(event)
        }
        // All good, continue
        break;
      } else {
        log.debug({ eventName: event.eventName }, `Reading value: {eventName}`);
        const el = await getElementForEvent({ page, event });
        const parsed = parseValue(el.data.text, event.parsing);
        if (parsed) {
          values[event.eventName] = parsed;
          break;
        }
        throw new ValueEventError(event)
      }
    }
  }
}

export async function enterValue(page: Page, event: AnyElementEvent, value: string) {
  const found = await getElementForEvent({ page, event });
  return await enterValueIntoFound(page, found, value);
}

export async function enterValueIntoFound(page: Page, found: SearchElement, value: string) {
  await found.element.focus();
  if (found.data.tagName == "INPUT" || found.data.tagName == "TEXTAREA") {
    // clear existing value
    await page.evaluate(el => (el as HTMLInputElement).value = "", found.element);
    // Simulate typing to mimic input actions
    await page.keyboard.type(value, { delay: 20 });
    return true;
  }
  else if (found.data.tagName == "SELECT") {
    // Click to open the select dropdown
    await found.element.click();

    // Find and click the matching option
    const optionSelected = await found.element.evaluate((select, value) => {
      const asSelect = select as HTMLSelectElement;
      const options = Array.from(asSelect.options);
      const option = options.find(o => o.text.includes(value) || o.value.includes(value));

      if (option) {
        // Dispatch events that would occur during user interaction
        option.selected = true;

        // Create and dispatch necessary events
        const changeEvent = new Event('change', { bubbles: true });
        const inputEvent = new Event('input', { bubbles: true });

        select.dispatchEvent(inputEvent);
        select.dispatchEvent(changeEvent);

        return true;
      }
      return false;
    }, value);

    if (!optionSelected) {
      log.warn(`Could not find option matching "${value}" in select element`);
      return false;
    }
    return true;
  }
  return false;
}
