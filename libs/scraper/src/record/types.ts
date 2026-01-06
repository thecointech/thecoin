import type { AnyEvent, ValueResult, ValueType } from "@thecointech/scraper-types";

// types injected into window
declare global {
  function __onAnyEvent(event: AnyEvent): boolean;
  // eslint-disable-next-line no-var
  var __eventsHooked: boolean;
  var __clickAction: "click" | "value" | "dynamicInput";
  var __clickTypeFilter: undefined | string;
  var __rehookEvents: () => void;
}

export type PromiseCallbacks<T> = {
  resolve: (value: T) => void;
  reject: (reason: string) => void;
}
export type ValueWaiter = {
  name: string,
  type: ValueType,
} & PromiseCallbacks<ValueResult>

export type DynamicInputWaiter = {
  name: string,
  value: string,
} & PromiseCallbacks<string>

export type RecorderOptions = {
  // A key to identify this sessions
  name: string
  // The context to run Puppeteer in
  context: string

  // A callback to run when scraping is complete
  onComplete?: (events: AnyEvent[]) => Promise<void>
}
