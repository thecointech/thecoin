import { log } from "@thecointech/logging";
import type { AnyEvent } from "@thecointech/scraper/types";
import type { Page } from "puppeteer";
import type { SectionName } from "./types";

export type EventSection = {
  section: SectionName;
  events: (AnyEvent|EventSection)[];
}

export interface IEventSectionManager {
  section: EventSection;
  cancel(): void;
  [Symbol.dispose](): void;
}

export class EventManager {

  allEvents: EventSection = { section: "Initial", events: [] }
  sectionStack: IEventSectionManager[] = [];
  get currentSection() { return this.sectionStack.at(-1)?.section ?? this.allEvents; }
  get currentEvents() { return this.currentSection.events; }

  // tempIntent: IntentEvents[] = [];
  // get currentIntent() { return this.tempIntent.at(-1) ?? this.allIntents.at(-1)!; }
  // get currentEvents() { return this.currentIntent.events; }

  pushEvent(event: AnyEvent) {
    this.currentEvents?.push(event);
  }

  pushSection(section: SectionName) : IEventSectionManager {
    const mgr = new EventManager.EventSectionMgr(this, section);
    return mgr;
  }

  // pushPotentialIntent(intent: EventIntent) {
  //   const temp = { intent, events: [] };
  //   this.tempIntent.push(temp);
  //   return temp;
  // }

  // confirmIntent(intent: IntentEvents) {
  //   this.allIntents.push(intent);
  //   this.clearTempIntent(intent);
  // }

  // clearTempIntent(intent: IntentEvents) {
  //   this.tempIntent = this.tempIntent.filter(s => s != intent);
  // }

  onEvent = async (event: AnyEvent, _page: Page, name: string, step: number) => {
    if (!this.currentEvents) throw new Error("No events list set!");

    // Can also do things like take a screenshot etc.
    if (event.type == "navigation") {
      // this.navigations++;
      log.trace(`Navigation started`);
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

  private _pauseEvents = 0;
  pause() {
    return new EventManager.Pauser(this);
  }

  private static Pauser = class {
    _mgr: EventManager;
    constructor(mgr: EventManager) {
      this._mgr = mgr;
      mgr._pauseEvents++;
      log.trace(`Pausing Events: ${mgr._pauseEvents}`);
    }
    [Symbol.dispose]() {
      this._mgr._pauseEvents--;
      log.trace(`Resuming Events: ${this._mgr._pauseEvents}`);
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
    cancel() {
      this._parent.events.splice(this._parent.events.indexOf(this.section), 1);
    }
    [Symbol.dispose]() {
      this._mgr.sectionStack.pop();
    }
  }
}
