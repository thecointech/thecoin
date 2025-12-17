import { AsyncEventEmitter, type EventListeners } from "./asyncEventEmitter";
import type { ElementSearchParams, FoundElement } from "@thecointech/scraper-types";

type EventMap = {
  "elementFound": [element: FoundElement, params: ElementSearchParams, candidates: FoundElement[]]
}
export class EventBus extends AsyncEventEmitter<EventMap> {
  static instance: EventBus;

  constructor() {
    super();
    EventBus.instance = this;
  }

  static get() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  onElement(callback: EventListeners<EventMap>["elementFound"]) {
    this.on("elementFound", callback);
  }
  async emitElement(element: FoundElement, params: ElementSearchParams, candidates: FoundElement[]) {
    await this.emitWithPromises("elementFound", element, params, candidates);
  }
  offElement(callback: EventListeners<EventMap>["elementFound"]) {
    this.off("elementFound", callback);
  }
}
