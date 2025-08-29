import { type Page } from 'puppeteer';
import { AnyEvent, InputEvent } from '../types';
import { log } from '@thecointech/logging';
import { RecorderOptions } from './types';
import { Registry } from './registry';
import { sleep } from '@thecointech/async';
import { EventEmitter } from 'node:events';
import { waitUntilLoadComplete } from './waitLoadComplete';
import { randomUUID } from "node:crypto";

type EventCallback = (event: AnyEvent, page: Page, name: string, step: number) => void;

export class Recorder extends EventEmitter implements AsyncDisposable {

  // Each new page loaded is a new step
  step = 0;
  events: AnyEvent[] = [];

  urlToFrameName: Record<string, string> = {};

  private options: RecorderOptions;
  private _page!: Page;

  private lastInputEvent: InputEvent | undefined;
  private seenEvents = new Set();

  onEvent(callback: EventCallback) {
    this.on("event", callback);
  }
  emitEvent(event: AnyEvent) {
    this.emit("event", event, this.page, this.name, this.step);
  }

  get name() {
    return this.options.name;
  }
  get page() {
    return this._page;
  }

  constructor(options: RecorderOptions) {
    super();
    this.options = options;
  }

  async initialize(page: Page) {
    this._page = page;

    await page.exposeFunction('__onAnyEvent', this.eventHandler);

    await page.evaluateOnNewDocument(onNewDocument);

    return page;
  }

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: "networkidle2" });
    await waitUntilLoadComplete(this.page);
  }

  async [Symbol.asyncDispose]() {

    log.info(`Recorder ${this.options.name} finalized disconnected with ${this.events.length} events`);

    // Trigger complete callback
    await this.options.onComplete?.(this.events);

    // Close the page (if it's open)
    try {
      await this.page.close();
      // wait for 1 second to ensure any messages get propagated through
      // It appears that the browser may not be disconnecting before the
      // next page is being created
      await sleep(1000);
    }
    catch (e) { /* probably already closed */ }

    // Remove the page from the instance, just in case someone tries to use it
    this._page = undefined!;

    // (Circular reference - needs cleaning)
    Registry.remove(this.options.name);
  }


  async clone(subName: string) {
    const url = this.page.url();
    const newRecorder = await Registry.create({ ...this.options, name: `${this.options.name}-${subName}` });
    await newRecorder.goto(url);
    return newRecorder;
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
    switch (event.type) {
    case 'navigation':
      if (event.to == 'about:blank') {
        return;
      }
      this.step = this.step + 1;
      break;
    case 'load':
      // We keep track of the iframes, and their related URLs
      const frames = this.page.frames()
        .map(f => {
          return [f.url(), f.name()]
        })
        .filter(v => !!v[1]);
      this.urlToFrameName = Object.fromEntries(frames);
      break;
    case "value":
      throw new Error("Manual value events need to be named & re-enabled");
    case "input": {
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
    }

    // If we have a pending input event, add it to the list first
    if (this.lastInputEvent) {
      this.saveEvent(this.lastInputEvent);
      this.lastInputEvent = undefined;
    }

    this.saveEvent(event);
  }

  saveEvent(event: AnyEvent) {
    this.events.push(event);
    this.emitEvent(event);
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
  // onNavigation = debounce((page: Page, step: number) =>
  //   this.options.onNavigation?.(page, step))
}

function onNewDocument() {

  __onAnyEvent({ type: "navigation", to: window.location.href, timestamp: Date.now(), id: randomUUID() });

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
        id: randomUUID()
      })
    });

    window.addEventListener("DOMContentLoaded", () => {
      __onAnyEvent({
        type: 'load',
        timestamp: Date.now(),
        id: randomUUID(),
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
        // This executes inside the page, so should _never_ happen
        if (!data) {
          throw new Error("Could not get element data");
        };

        const evt = {
          timestamp: Date.now(),
          id: randomUUID(),
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
              eventName: "--UNSET--",
              ...evt
            })
          }, 750);
        }
        else {
          // For click/value, send immediately
          __onAnyEvent({
            type: __clickAction,
            eventName: "clicked",
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
        eventName: "valueChange",
        timestamp: Date.now(),
        id: randomUUID(),
        valueChange: true,
        value: target?.value,
        ...window.getElementData(target)!
      })
    }, opts);

    const enterEventListener = (ev: Event) => {
      if (ev instanceof KeyboardEvent) {
        // is this an enter key?
        if (ev.key == "Enter") {
          __onAnyEvent({
            type: "input",
            eventName: "hitEnter",
            timestamp: Date.now(),
            id: randomUUID(),
            hitEnter: true,
            value: (ev.target as HTMLInputElement)?.value,
            ...window.getElementData(ev.target as HTMLElement)!
          })
        }
        else {
          __onAnyEvent({
            type: "input",
            eventName: "keyDown",
            timestamp: Date.now(),
            id: randomUUID(),
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
