import { AsyncEventEmitter } from "@thecointech/scraper/events/asyncEventEmitter";
import { SectionName } from "./types";
import type { AxiosResponse } from "axios";

export interface ApiCallEvent {
  apiName: string;
  method: string;
  request: any[];
  response?: AxiosResponse;
  error?: unknown;
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
  offApiCall(callback: (event: ApiCallEvent) => void) {
    this.off("apiCall", callback)
  }

  onSection(callback: (event: SectionName) => void) {
    this.on("section", callback);
  }
  async emitSection(event: SectionName) {
    await this.emitWithPromises("section", event);
  }
  offSection(callback: (event: SectionName) => void) {
    this.off("section", callback);
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
