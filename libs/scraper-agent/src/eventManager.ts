import { log } from "@thecointech/logging";
import type { AnyEvent, DynamicInputEvent, ElementData, FoundElement, ValueEvent, ValueType } from "@thecointech/scraper/types";
import type { Page } from "puppeteer";
import type { EventSection, SectionName } from "./types";
import { getValueParsing } from "@thecointech/scraper/valueParsing";
import { bus } from "./eventbus";

/**
 * A manager for events that occur during a scrape.
 * This class is responsible for keeping track of the current section and events.
 * It also provides methods for pushing new events and sections.
 */
export interface IEventSectionManager extends AsyncDisposable {
  section: EventSection;
  cancel(): void;
}

/**
 * A pauser prevents events from being collected while it is alive
 * It contains the events that were collected while paused,
 * mostly for debugging purposes.
 */
interface IPauser extends Disposable {
  // Events collected while paused.
  discards: AnyEvent[];
}

// Utility type to prevent type inference
// NOTE!  This can be removed in TS5.4 (whenever we upgrade)
type NoInfer<T> = [T][T extends any ? 0 : never];

export class EventManager {
  private _eventFilters: Page[] = [];
  pushPageFilter(page: Page) {
    this._eventFilters.push(page);
  }
  popPageFilter() {
    this._eventFilters.pop();
  }

  allEvents: EventSection = { section: "Initial", events: [] }
  sectionStack: IEventSectionManager[] = [];
  get currentSection() { return this.sectionStack.at(-1)?.section ?? this.allEvents; }
  get currentEvents() { return this.currentSection.events; }


  // Manual event push.  Will push to current section, ignoring pausers.
  pushEvent(event: AnyEvent) {
    this.currentEvents?.push(event);
  }

  async pushValueEvent<T>(element: FoundElement, name: Extract<keyof NoInfer<T>, string>, type: ValueType) {
    const event: ValueEvent = {
      type: "value",
      eventName: name,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
      ...element.data
    };

    event.parsing = (type == "table")
      ? {
          type: "table",
          format: null,
        }
      : getValueParsing(element.data.text, type);

    this.pushEvent(event);
    return event;
  }

  pushDynamicInputEvent<T>(element: ElementData, name: Extract<keyof NoInfer<T>, string>) {
        const event: DynamicInputEvent = {
          type: "dynamicInput",
          eventName: name,
          timestamp: Date.now(),
          id: crypto.randomUUID(),
          ...element,
        };
        this.pushEvent(event);
        return event;
  }

  pushSection(section: SectionName) : IEventSectionManager {
    const mgr = new EventManager.EventSectionMgr(this, section);
    return mgr;
  }

  onEvent = async (event: AnyEvent, page: Page, name: string, step: number) => {
    if (!this.currentEvents) throw new Error("No events list set!");

    // Only listen to events from the current page
    const filter = this._eventFilters.at(-1);
    if (filter && filter != page) {
      return;
    }

    const pauser = this._eventPausers.at(-1);
    if (pauser) {
      pauser.discards.push(event);
      return;
    }

    // Can also do things like take a screenshot etc.
    if (event.type == "navigation") {
      // this.navigations++;
      // log.trace(`Navigation started`);
    }
    else if (event.type == "load") {
      // if (--this.navigations == 0) {
        // log.trace(`Navigation complete`);
      // }
      // log.trace('load')
      return;
    }
    else {
      log.trace(`Event: ${event.type} @ step ${step} for ${name}`);
    }
    this.currentEvents.push(event);
  }

  private _eventPausers: IPauser[] = [];
  pause() {
    return new EventManager.Pauser(this);
  }


  private static Pauser = class implements IPauser {
    _mgr: EventManager;
    // Track events captured while paused
    discards: AnyEvent[] = [];
    constructor(mgr: EventManager) {
      this._mgr = mgr;
      mgr._eventPausers.push(this);
      log.trace(`Pausing Events: ${mgr._eventPausers.length}`);
    }
    [Symbol.dispose]() {
      this._mgr._eventPausers.splice(this._mgr._eventPausers.indexOf(this), 1);
      log.trace(`Resuming Events: ${this._mgr._eventPausers.length}, ${this.discards.length} events discarded`);
    }
  }

  private static EventSectionMgr = class implements IEventSectionManager {
    section: EventSection;
    _name: SectionName;
    _parent: EventSection;
    _mgr: EventManager;
    _isDisposed = false;
    constructor(mgr: EventManager, section: SectionName) {
      this._name = section;
      this._mgr = mgr;
      this._parent = mgr.currentSection;
      this.section = { section, events: [] };
      this._parent.events.push(this.section);
      this._mgr.sectionStack.push(this);
      bus().emitSection(section);
    }
    async [Symbol.asyncDispose]() {
      this._isDisposed = true;
      this._mgr.sectionStack.pop();
      bus().emitSection(this._parent.section);
    }
    cancel() {
      if (this._isDisposed) {
        log.error("Cancelling disposed section: " + this._name);
        return;
      }
      this._parent.events.splice(this._parent.events.indexOf(this.section), 1);
    }
  }
}
