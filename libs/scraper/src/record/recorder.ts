import { type Page } from 'puppeteer';
import type { AnyEvent, InputEvent } from '@thecointech/scraper-types';
import { log } from '@thecointech/logging';
import type { RecorderOptions } from './types';
import { Registry } from './registry';
import { sleep } from '@thecointech/async';
import { EventEmitter } from 'node:events';
import { waitUntilLoadComplete } from './waitLoadComplete';
import { onNewDocument } from './recorder.browser';

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
