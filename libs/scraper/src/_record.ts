import type { Page } from 'puppeteer';
import { debounce } from './debounce';
import { startElementHighlight } from './highlighter';
import { getTableData } from './table';
import { closeBrowser, newPage } from './puppeteer-init/init';
import { AnyEvent, InputEvent, ValueResult, ValueType } from './types';
import { getValueParsing } from './valueParsing';
import { log } from '@thecointech/logging';

// types injected into window
declare global {
  function __onAnyEvent(event: AnyEvent): boolean;
  // eslint-disable-next-line no-var
  var __eventsHooked: boolean;
  var __clickAction: "click" | "value" | "dynamicInput";
  var __clickTypeFilter: undefined | string;
  var __rehookEvents: () => void;
}

type ValueWaiter = {
  name: string,
  type: ValueType,
  resolve: (value: ValueResult) => void;
}
type DynamicInputWaiter = {
  name: string,
  value: string,
  resolve: (value: string) => void;
}

type RecorderOptions = {
  // Whether to run puppeteer in headless mode
  headless?: boolean
  // A key to identify this sessions
  name: string
  // An initial url to load
  url?: string
  // A callback to report progress
  onProgress?: (progress: number) => void

  onEvent?: (event: AnyEvent) => Promise<void>

  // A callback to run when scraping is complete
  onComplete?: (events: AnyEvent[]) => Promise<void>

  // Callback when new page is finished loading
  onNavigation?: (page: Page, step: number) => void

  // Callback allows us to filter events we don't want to remember
  eventFilter?: (event: AnyEvent) => boolean
  // An array of selectors to monitor for dynamic input
  dynamicInputs?: string[];
}

export class Recorder {

  disconnected?: Promise<boolean>;
  // Each new page loaded is a new step
  step = 0;
  events: AnyEvent[] = [];

  // inputs can either be static (ie - constant every time)
  // or dynamic (ie - supplied each run).  We set the
  // required dynamic inputs in the constructor, and the
  // recording will not be successful if they are not captured.
  dynamicInputs: Record<string, boolean>;

  urlToFrameName: Record<string, string> = {};

  private options: RecorderOptions;

  private page!: Page;
  private onValue?: ValueWaiter;
  private onInput?: DynamicInputWaiter;
  // private static __instance?: Recorder;

  private lastInputEvent: InputEvent | undefined;
  private seenEvents = new Set();

  public getPage = () => this.page;

  private constructor(options: RecorderOptions) {

    this.options = options;
    this.dynamicInputs = Object.fromEntries(
      options.dynamicInputs?.map(name => [name, false]
    ) ?? []);
    log.info(`Recording with dynamic inputs: ${options.dynamicInputs?.join(', ') ?? 'none'}`);
  }

  private async initialize(url: string) {
    const { browser, page } = await newPage(this.options.headless);
    this.page = page;

    await page.exposeFunction('__onAnyEvent', this.eventHandler);

    await page.evaluateOnNewDocument(onNewDocument);

    if (url != "about:blank") {
      await page.goto(url, { waitUntil: "networkidle2" });
    }

    this.disconnected = new Promise((resolve, reject) => {
      browser.on('disconnected', async () => {

        log.info(`browser disconnected with ${this.events.length} events`);

        // Verify that we got all our dyamic inputs
        for (const [name, value] of Object.entries(this.dynamicInputs)) {
          if (!value) {
            log.error(`Dynamic input ${name} was not captured`)
            reject(`Dynamic input ${name} was not captured`)
          }
        }

        await this.options.onComplete?.(this.events);
        // await setEvents(this.name, this.events);

        // Cleanup
        // delete Recorder.__instance;
        // Recorder.__instance = undefined;
        resolve(true);
      })
    })

    return page;
  }

  static async instance(options?: RecorderOptions) {
    // Should we re?
    if (Recorder.__instance) {
      if (!options?.name || Recorder.__instance.options?.name == options.name) {
        return Recorder.__instance
      } else {
        throw new Error("Cannot start recording new session without closing prior session")
      }
    }
    // We have no instance, we need a name & url
    if (!options?.url || !options.name) {
      throw new Error("Cannot fetch existing session - none running")
    }
    Recorder.__instance = new Recorder(options);
    await Recorder.__instance.initialize(options.url);
    return Recorder.__instance;
  }

  static async release() {
    if (Recorder.__instance) {
      // This should take care of all the cleanup
      await closeBrowser();
      Recorder.__instance = undefined;
      return true;
    }
    return false;
  }

  // Enter value-read mode
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
      // Blur current input to force user click
      window.focus()
      if (document.activeElement instanceof HTMLInputElement) {
        document.activeElement.blur()
      }
    })
    await this.page.evaluate(startElementHighlight);
    return waiter;
  }

  // Enter value-write mode
  setDynamicInput = async (name: string, value: string) => {
    const waiter = new Promise<string>(resolve => {
      this.onInput = {
        name,
        value,
        resolve
      }
    })

    await this.page.evaluate(() => {
      globalThis.__rehookEvents?.();
      __clickAction = "dynamicInput";
      __clickTypeFilter = "(INPUT)|(TEXTAREA)";
    })
    await this.page.evaluate(startElementHighlight);
    return waiter;
  }

  // Record the stream of events from the browser.
  eventHandler = async (event: AnyEvent) => {
    // convert URL to frame name
    if ("frame" in event && event.frame) {
      event.frame = this.urlToFrameName[event.frame] ?? event.frame;
    }
    // Skip duplicate events
    if (this.isDuplicate(event)) {
      return;
    }
    // Cache all event ID's to ensure that we never duplicate an event
    this.seenEvents.add(event.id);

    // log.debug("event name: " + event.type);
    if (event.type == 'navigation') {
      if (event.to == 'about:blank') {
        return;
      }
      this.step = this.step + 1;
    }
    else if (event.type == 'load') {
      // Debounce this as we get multiple page-loads for the same step
      this.onNavigation?.(this.page, this.step);

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
      // This is a dynamic input event, we can ignore it.
      if (this.onInput) {
        return;
      }
      // Input events come in a stream, and we cache them
      // until we have the final one.
      if (event.hitEnter || event.valueChange) {
        // If user hit's enter or input emits value changed, this
        // is final and we can drop the cache
        this.lastInputEvent = undefined;
      }
      else {
        // we are mid-stream, cache the event and return
        this.lastInputEvent = event;
        return;
      }
    }
    else if (event.type == "dynamicInput") {
      if (!this.onInput) {
        log.error("DYNAMIC INPUT MARK WITH NO CB");
        throw new Error();
      }
      event.dynamicName = this.onInput.name;
      // Set the input in the webpage
      // clear existing value
      const element = await this.page.$(event.selector);
      await element?.evaluate(el => (el as HTMLInputElement).value = "");
      await element?.focus();
      await this.page.keyboard.type(this.onInput.value, { delay: 20 });
      await this.page.evaluate(el => (el as HTMLInputElement).blur(), element);

      // await this.page.$eval(event.selector, (el, value) => (el as HTMLInputElement).value = value, this.onInput.value);
      // Mark this input as successfully captured
      this.dynamicInputs[this.onInput.name] = true;
      // Resolve the promise (notify the user that we're done)
      this.onInput.resolve(event.selector);
      this.onInput = undefined;
    }
    else if (event.type == "value") {
      // If we have a promise awaiting (and we really should!)
      if (!this.onValue) {
        log.error("VALUE MARK WITH NO CB");
        throw new Error();
      }
      event.name = this.onValue.name;
      const text = await this.page.$eval(event.selector, (el => (el as HTMLElement).innerText));
      if (this.onValue.type == "table") {
        const table = await getTableData(this.page);
        event.parsing = {
          type: "table",
          format: null,
        }
        // Return the most recent payment
        // const mostRecentPayment = table.find(row => row.credit?.intValue)?.credit;
        this.onValue.resolve({
          text: "Your most recent tx was on: " + table?.[0].date.toSQLDate(),
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

    // If we have a pending input event, add it to the list first
    if (this.lastInputEvent) {
      this.saveEvent(this.lastInputEvent);
      this.lastInputEvent = undefined;
    }

    this.saveEvent(event);
  }

  saveEvent(event: AnyEvent) {
    this.logEvent(event);
    if(this.options.eventFilter?.(event) !== false) {
      this.events.push(event);
    }
  }

  isDuplicate(event: AnyEvent) {
    if (this.seenEvents.has(event.id)) {
      const lastEvent = this.events.find(e => e.id == event.id);
      // Most duplicates are due to multiple events being sent, one with a frame and one without
      // We don't want to log them twice, but we do want to keep the frame (even if not currently used)
      if (lastEvent && "frame" in lastEvent && "frame" in event) {
        if (!lastEvent.frame && event.frame) {
          lastEvent.frame = event.frame;
        }
      }
      // All duplicates are dropped
      // console.log("Duplicate event");
      return true;
    }
    return false;
  }
  logEvent(event: AnyEvent) {
    // strip value out to prevent logging sensitive info
    const { value, ...sanitized } = event as any;
    log.debug(`Received event: ${JSON.stringify(sanitized)}`)
  }
  onNavigation = debounce((page: Page, step: number) =>
    this.options.onNavigation?.(page, step))
}

function onNewDocument() {

  __onAnyEvent({ type: "navigation", to: window.location.href, timestamp: Date.now(), id: crypto.randomUUID() });

  globalThis.__clickAction = "click";
  globalThis.__clickTypeFilter = undefined;

  // Disable console.clear
  console.clear = () => {};

  if (!globalThis.__eventsHooked) {
    const opts = {
      capture: true,
      passive: true
    };

    /////////////////////////////////////////////////////////////////////////

    window.addEventListener("load", () => {
      __onAnyEvent({
        type: 'load',
        timestamp: Date.now(),
        id: crypto.randomUUID()
      })
    });

    window.addEventListener("DOMContentLoaded", () => {
      __onAnyEvent({
        type: 'load',
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      })
    });

    const getFilteredTarget = (ev: MouseEvent): HTMLElement|null => {
      //console.log(`GettingFiltered: ${(ev.target as any)?.nodeName}, id: ${(ev.target as any)?.id}, x: ${ev.pageX}, y: ${ev.pageY}`);

      if (ev.target instanceof HTMLElement) {
        if (!__clickTypeFilter) {
          return ev.target;
        }

        const typerex = new RegExp(__clickTypeFilter);
        // If we have a filter, does the default match?
        if (typerex.test(ev.target.nodeName)) {
          return ev.target;
        }
        const x = ev.pageX;
        const y = ev.pageY;
        const els = document.elementsFromPoint(x, y);
        for (const el of els) {
          if (typerex.test(el.nodeName)) {
            return el as HTMLElement;
          }
        }
      }
      return null;
    }

    // listen to clicks
    const clickEventListener = (ev: MouseEvent) => {
      const target = getFilteredTarget(ev);

      if (target) {
        // Get local copies of the data to ensure we don't care
        // about any changes that may be made during the click
        const data = window.getElementData(target);
        // This should _never_ happen
        if (!data) {
          throw new Error("Could not get element data");
        };

        const evt = {
          timestamp: Date.now(),
          id: crypto.randomUUID(),
          clickX: ev.pageX,
          clickY: ev.pageY,
          ...data
        }

        if (__clickAction == "dynamicInput") {
          // Allow any events to process before
          // we take over the execution of the click
          setTimeout(() => {
            __onAnyEvent({
              type: "dynamicInput",
              dynamicName: "--UNSET--",
              ...evt
            })
          }, 750);
        }
        else {
          // Send immediately
          __onAnyEvent({
            type: __clickAction,
            ...evt
          });
        }

        // Take no action if reading value
        if (__clickAction == "value") {
          //console.log("Reading Value: " + target.innerText);
          ev.preventDefault();
          ev.stopImmediatePropagation();
        }
        __clickAction = "click";
        __clickTypeFilter = undefined;
      }
      else {
        // Do not capture clicks on unrelated elements
        //console.log("Skipping click");
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    }
    window.addEventListener("click", clickEventListener, { capture: true });
    // Allow our hooks to supersede anything being applied by the page
    globalThis.__rehookEvents = () => {
      //console.log("Rehooking Events");
      window.removeEventListener("click", clickEventListener, { capture: true });
      window.addEventListener("click", clickEventListener, { capture: true });
    }

    // When leaving an input, capture it's value
    window.addEventListener("change", (ev) => {
      // Is this an input?
      const target = ev.target as HTMLInputElement;
      __onAnyEvent({
        type: "input",
        timestamp: Date.now(),
        id: crypto.randomUUID(),
        valueChange: true,
        value: target?.value,
        ...window.getElementData(target)!
      })
    }, opts);

    // window.addEventListener('submit', (ev) => {
    //   //console.log("Submitting: ", ev.target);
    // });

    const enterEventListener = (ev: Event) => {
      if (ev instanceof KeyboardEvent) {
        // is this an enter key?
        if (ev.key == "Enter") {
          __onAnyEvent({
            type: "input",
            timestamp: Date.now(),
            id: crypto.randomUUID(),
            hitEnter: true,
            value: (ev.target as HTMLInputElement)?.value,
            ...window.getElementData(ev.target as HTMLElement)!
          })
        }
        else {
          __onAnyEvent({
            type: "input",
            timestamp: Date.now(),
            id: crypto.randomUUID(),
            value: (ev.target as HTMLInputElement)?.value + ev.key,
            ...window.getElementData(ev.target as HTMLElement)!
          })
        }
      }
    }

    window.addEventListener('focusin', (ev) => {
      // Is this an input?
      //console.log("Focusin: ", ev.target);
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
        ev.target.addEventListener('keydown', enterEventListener, opts)
      }
    })
    window.addEventListener('focusout', ev => {
      //console.log("Focusout: ", ev.target);
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
        ev.target?.removeEventListener('keydown', enterEventListener)
      }
    })

    globalThis.__eventsHooked = true;
  }
}
