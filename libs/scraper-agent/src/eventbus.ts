import { AsyncEventEmitter } from "@thecointech/scraper/events/asyncEventEmitter";
import { SectionName } from "./types";

export interface ApiCallEvent {
  apiName: string;
  method: string;
  request: any;
  response?: any;
  error?: any;
  timestamp: number;
}

type EventMap = {
  apiCall: [event: ApiCallEvent];
  section: [event: SectionName];
}

export class EventBus extends AsyncEventEmitter<EventMap> {
  // Event emitter for API calls
  // This is to allow auto-recording
  onApiCall(callback: (event: ApiCallEvent) => void) {
    this.on("apiCall", callback);
  }
  async emitApiCall(event: ApiCallEvent) {
    await this.emitWithPromises("apiCall", event);
  }

  onSection(callback: (event: SectionName) => void) {
    this.on("section", callback);
  }
  async emitSection(event: SectionName) {
    await this.emitWithPromises("section", event);
  }
}

declare global {
  var __tc_eventBus: EventBus;
}
export function bus() {
  if (!global.__tc_eventBus) {
    global.__tc_eventBus = new EventBus();
  }
  return global.__tc_eventBus;
}
