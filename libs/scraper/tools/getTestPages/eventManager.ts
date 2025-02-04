import { log } from "@thecointech/logging";
import { AnyEvent } from "../../src/types";
import { Page } from "puppeteer";

export class EventManager {
  // navigations = 0;

  eventsList: { event: AnyEvent, step: number, name: string }[] = [];
  onEvent = async (event: AnyEvent, _page: Page, name: string, step: number) => {
    if (!this._pauseEvents) {
      // Can also do things like take a screenshot etc.
      if (event.type == "navigation") {
        // this.navigations++;
        log.trace(`Navigation started`);
      }
      else if (event.type == "load") {
        // if (--this.navigations == 0) {
          // log.trace(`Navigation complete`);
        // }
        log.trace('load')
        return;
      }
      else {
        log.trace(`Event: ${event.type} @ step ${step} for ${name}`);
      }
      this.eventsList.push({ event, step, name });

    }
  }

  private _pauseEvents = 0;
  pause() {
    return new EventManager.Pauser(this);
  }

  static Pauser = class {
    private _mgr: EventManager;
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
}
