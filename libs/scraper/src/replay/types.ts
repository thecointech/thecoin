import type { Page } from "puppeteer";
import type { ScraperProgressCallback } from "../callbacks";
import type { ReplayResult, AnyEvent } from "@thecointech/scraper-types";

export type ReplayOptions = {
  name: string,
  events: AnyEvent[],
  delay?: number,
  dynamicValues?: Record<string, string>,
  callbacks?: IReplayCallbacks,
}

export type Replay = {
  page: Page,
  values: ReplayResult,
} & ReplayOptions;

export type ReplayErrorParams = {
  // The caught exception
  err: unknown,
  // The event being processed
  event: AnyEvent,
  // The original replay object
  replay: Replay,
}

// Attempt to handle an error.  If the error was handled gracefully,
// return the index of the event to continue from.  If the error was not
// handled gracefully, return undefined to stop the replay.
export type ReplayErrorCallback = (params: ReplayErrorParams) => Promise<number|undefined>;

export type IReplayCallbacks = {
onError?: ReplayErrorCallback;
onProgress?: ScraperProgressCallback;
}
