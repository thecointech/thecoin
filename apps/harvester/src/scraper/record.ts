import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import type { Browser, Page } from 'puppeteer';
import { debounce } from './debounce';
import { startElementHighlight } from './highlighter';
import { getTableData } from './table';
import { startPuppeteer } from './puppeteer';
import { ActionTypes, AnyEvent, ValueResult, ValueType } from './types';
import { getValueParsing } from './valueParsing';
import { log } from '@thecointech/logging';
import { setEvents } from '../Harvester/config';
import { outFolder } from '../paths';
import { registerElementAttrFns } from './elements';

// types injected into window
declare global {
  function __onAnyEvent(event: AnyEvent): boolean;
  // eslint-disable-next-line no-var
  var __eventsHooked: boolean;
  // eslint-disable-next-line no-var
  var __clickAction: "click" | "value";
}

type ValueWaiter = {
  name: string,
  type: ValueType,
  resolve: (value: ValueResult) => void;
}

export class Recorder {

  readonly name: ActionTypes;
  readonly screenshotFolder: string;
  disconnected?: Promise<boolean>;
  step = 0;
  events: AnyEvent[] = [];

  // inputs can either be static (ie - constant every time)
  // or dynamic (ie - supplied each run).  The capture Record
  // here tests input values against a pre-supplied list of
  // values, if one matches then we mark the input for substitution
  dynamicValues: Record<string, string>;

  urlToFrameName: Record<string, string> = {};

  private page!: Page;
  private browser!: Browser;
  private onValue?: ValueWaiter;
  private static __instance?: Recorder;

  private constructor(name: ActionTypes, dynamicValues?: Record<string, string>) {
    this.name = name;
    this.screenshotFolder = path.join(outFolder, this.name);

    this.dynamicValues = dynamicValues ?? {};
    log.info(`Recording ${this.name} with dynamic values ${JSON.stringify(this.dynamicValues)}`);
  }
  private async initialize(url: string) {
    const { browser, page } = await startPuppeteer(false);
    this.browser = browser;
    this.page = page;

    if (!existsSync(this.screenshotFolder)) {
      mkdirSync(this.screenshotFolder, { recursive: true })
    }

    await registerElementAttrFns(page);

    await page.exposeFunction('__onAnyEvent', this.eventHandler);

    await page.evaluateOnNewDocument(onNewDocument);

    await page.goto(url);

    this.disconnected = new Promise((resolve) => {
      browser.on('disconnected', async () => {

        log.info(`browser disconnected with ${this.events.length} events`);
        await setEvents(this.name, this.events);

        // Cleanup
        delete Recorder.__instance;
        Recorder.__instance = undefined;
        resolve(true);
      })
    })

    return page;
  }

  static async instance(name?: ActionTypes, url?: string, capture?: Record<string, string>) {
    // Should we re?
    if (Recorder.__instance) {
      if (!name || Recorder.__instance.name == name) return Recorder.__instance
      else {
        throw new Error("Cannot start recording new session without closing prior session")
      }
    }
    // We have no instance, we need a name & url
    if (!name || !url) {
      throw new Error("Cannot fetch existing session - none running")
    }
    Recorder.__instance = new Recorder(name, capture);
    await Recorder.__instance.initialize(url);
    return Recorder.__instance;
  }

  static async release(name?: string) {
    if (Recorder.__instance) {
      if (!name || Recorder.__instance.name == name) {
        // This should take care of all the cleanup
        Recorder.__instance.browser.close();
        return true;
      }
    }
    return false;
  }

  setRequiredValue = async (name = "defaultValue", type: ValueType = "text") => {
    const waiter = new Promise<ValueResult>(resolve => {
      this.onValue = {
        name,
        type,
        resolve
      }
    })

    await this.page.evaluate(() => {
      __clickAction = "value";
    })
    await this.page.evaluate(startElementHighlight);
    return waiter;
  }

  eventHandler = async (event: AnyEvent) => {
    log.debug("event name: " + event.type);
    if (event.type == 'navigation') {
      if (event.to == 'about:blank') {
        return;
      }
      this.step = this.step + 1;
    }
    else if (event.type == 'load') {
      // Debounce this as we get multiple page-loads for the same step
      this.saveScreenshot(this.page, `record-${this.step}.png`);

      // We keep track of the iframes, and their related URLs
      const frames = this.page.frames()
        .map(f => {
          return [f.url(), f.name()]
        })
        .filter(v => !!v[1]);
      this.urlToFrameName = Object.fromEntries(frames);
      // the load events are only useful for getting screenshots,
      // so don't keep them
      return;
    }
    else if (event.type == "input") {
      const captured = Object.entries(this.dynamicValues).find(v => v[1] == event.value);
      if (captured) event.dynamicName = captured[0];
    }
    else if (event.type == "value") {
      // If we have a promise awaiting (and we really should!)
      if (!this.onValue) {
        log.error("VALUE MARK WITH NO CB");
        throw new Error();
      }
      if (event.frame) {
        event.frame = this.urlToFrameName[event.frame]
      }
      event.name = this.onValue.name;
      const text = await this.page.$eval(event.selector, (el => (el as HTMLElement).innerText));
      if (this.onValue.type == "table") {
        const table = await getTableData(this.page, event.font);
        event.parsing = {
          type: "table",
          format: null,
        }
        // Return the most recent payment
        const mostRecentPayment = table.find(row => row.credit)?.credit;
        this.onValue.resolve({
          text: "Your most recent payment was: " + mostRecentPayment,
          parsing: { type: "text", format: null },
        });
      }
      else {
        event.parsing = getValueParsing(text, this.onValue.type);
        this.onValue.resolve({
          text,
          parsing: event.parsing,
        });
      }
      this.onValue = undefined;
    }
    if (event.type == 'click') {
      // Dig through any frames on the page to find our element
      if (event.frame) {
        event.frame = this.urlToFrameName[event.frame]
      }
    }

    // strip value out to prevent logging sensitive info
    const { value, ...sanitized } = event as any;
    log.debug(`Received event: ${JSON.stringify(sanitized)}`)
    this.events.push(event);
  }

  saveScreenshot = debounce((page: Page, fileName: string) => page.screenshot({ path: path.join(this.screenshotFolder, fileName) }))
}

function onNewDocument() {
  __onAnyEvent({ type: "navigation", to: window.location.href, timestamp: Date.now() });

  globalThis.__clickAction = "click";

  if (!globalThis.__eventsHooked) {
    const opts = {
      capture: true,
      passive: true
    };

    // Inspired by: https://stackoverflow.com/questions/42184322/javascript-get-element-unique-selector
    // const getSelector = (elem: HTMLElement, descendentSelector = ''): string => {
    //   const {
    //     tagName,
    //     id,
    //     parentNode
    //   } = elem;

    //   if (tagName === 'HTML') return `HTML${descendentSelector}`;

    //   const thisSel = (id !== '')
    //     ? `${tagName}#${CSS.escape(id)}`
    //     : tagName;

    //   const selected = document.querySelectorAll(thisSel + descendentSelector);
    //   if (selected.length == 1) return thisSel + descendentSelector;
    //   if (selected.length == 0) {
    //     console.error("Cannot find element with selector: " + thisSel + descendentSelector)
    //     // Return a selector that still works
    //     return descendentSelector.slice(2)
    //   }

    //   // Skip class names, we don't need them and they
    //   // can be altered in js to mess us up (eg - on mouseover)
    //   // if (className) {
    //   //   const classes = className.split(/\s/);
    //   //   for (let i = 0; i < classes.length; i++) {
    //   //     thisSel += `.${classes[i]}`;
    //   //   }
    //   // }

    //   let childIndex = 1;

    //   for (let e: Element = elem; e.previousElementSibling; e = e.previousElementSibling) {
    //     childIndex += 1;
    //   }

    //   const selector = `${thisSel}:nth-child(${childIndex})${descendentSelector}`;
    //   if (document.querySelectorAll(selector).length == 1) return selector;

    //   return parentNode
    //     ? getSelector(parentNode as HTMLElement, ` > ${selector}`)
    //     : selector;
    // }

    // // get document coordinates of the element
    // const getCoords = (elem: HTMLElement) => {
    //   const box = elem.getBoundingClientRect();
    //   return {
    //     top: box.top + window.pageYOffset,
    //     right: box.right + window.pageXOffset,
    //     bottom: box.bottom + window.pageYOffset,
    //     left: box.left + window.pageXOffset
    //   };
    // }

    // const getFontData = (elem: HTMLElement) => {
    //   const styles = getComputedStyle(elem);
    //   return {
    //     font: styles.font,
    //     color: styles.color,
    //     size: styles.fontSize,
    //     style: styles.fontStyle,
    //   }
    // }

    // const getSiblingText = (el: HTMLElement) => {
    //   const text = el.innerText;
    //   const findParent = (el: HTMLElement): HTMLElement | null => el?.innerText?.startsWith(text) ? findParent(el.parentElement as HTMLElement) : el;
    //   const ancestor = findParent(el);
    //   if (ancestor) {
    //     // Is this a row?
    //     const elcoords = getCoords(el);
    //     const rowcoords = getCoords(ancestor);
    //     // Is it much higher than element?
    //     const heightFactor = (
    //       (rowcoords.bottom - rowcoords.top) /
    //       (elcoords.bottom - elcoords.top)
    //     )
    //     if (heightFactor > 2.5) return undefined;
    //     const widthFactor = (
    //       (rowcoords.right - rowcoords.left) /
    //       (elcoords.right - elcoords.left)
    //     )
    //     if (widthFactor < 2.5) return undefined
    //     const rowText = ancestor.innerText;
    //     return rowText.split(text)[0]?.trim();
    //   }
    //   return undefined;
    // }

    // const getFrameUrl = () => {
    //   // Because this runs in the context of the frame, it's
    //   // always that frames href
    //   return location.href
    // }

    // const getElementData = (el: HTMLElement): ElementData => ({
    //   frame: getFrameUrl(),
    //   tagName: el.tagName,
    //   selector: getSelector(el),
    //   coords: getCoords(el),
    //   siblingText: getSiblingText(el),
    // })

    /////////////////////////////////////////////////////////////////////////

    window.addEventListener("load", () => {
      __onAnyEvent({
        type: 'load',
        timestamp: Date.now()
      })
    });

    window.addEventListener("DOMContentLoaded", () => {
      __onAnyEvent({
        type: 'load',
        timestamp: Date.now()
      })
    });

    // listen to clicks
    window.addEventListener("click", (ev) => {
      if (ev.target instanceof HTMLElement) {
        __onAnyEvent({
          type: __clickAction,
          timestamp: Date.now(),
          clickX: ev.pageX,
          clickY: ev.pageY,
          // @ts-ignore
          ...window.getElementData(ev.target)
        });
        // Reset back to the default
        if (__clickAction == "value") {
          console.log("Reading Value: " + ev.target.innerText);
          ev.preventDefault();
          ev.stopImmediatePropagation();
          __clickAction = "click";
        }
      }
    }, { capture: true });

    // When leaving an input, capture it's value
    window.addEventListener("change", (ev) => {
      // Is this an input?
      const target = ev.target as HTMLInputElement;
      __onAnyEvent({
        type: "input",
        timestamp: Date.now(),
        value: target?.value,
          // @ts-ignore
          ...window.getElementData(ev.target)
      })
    }, opts);

    globalThis.__eventsHooked = true;
  }
}
