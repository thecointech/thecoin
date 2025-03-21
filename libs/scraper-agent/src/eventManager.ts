import { log } from "@thecointech/logging";
import type { AnyEvent } from "@thecointech/scraper/types";
import type { Page } from "puppeteer";
import type { EventSection, SectionName } from "./types";

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

export class EventManager {

  allEvents: EventSection = { section: "Initial", events: [] }
  sectionStack: IEventSectionManager[] = [];
  get currentSection() { return this.sectionStack.at(-1)?.section ?? this.allEvents; }
  get currentEvents() { return this.currentSection.events; }


  // Manual event push.  Will push to current section, ignoring pausers.
  pushEvent(event: AnyEvent) {
    this.currentEvents?.push(event);
  }

  pushSection(section: SectionName) : IEventSectionManager {
    const mgr = new EventManager.EventSectionMgr(this, section);
    return mgr;
  }

  onEvent = async (event: AnyEvent, _page: Page, name: string, step: number) => {
    if (!this.currentEvents) throw new Error("No events list set!");

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
    _parent: EventSection;
    _mgr: EventManager;
    constructor(mgr: EventManager, section: SectionName) {
      this._mgr = mgr;
      this._parent = mgr.currentSection;
      this.section = { section, events: [] };
      this._parent.events.push(this.section);
      this._mgr.sectionStack.push(this);
    }
    async [Symbol.asyncDispose]() {
      this._mgr.sectionStack.pop();
    }
    cancel() {
      this._parent.events.splice(this._parent.events.indexOf(this.section), 1);
    }
  }
}
