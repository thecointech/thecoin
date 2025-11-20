import type { Page } from "puppeteer";
import type { AnyEvent, ReplayResult } from "@thecointech/scraper-types";

export type ScraperProgress = {
  stage: string, // Name of the step
  step: number, // Index of the step in total
  total: number, // The total number of steps
  stepPercent?: number // The percentage the current step is complete
  event?: AnyEvent // Only filled out in replay
}

// Report progress, return false to stop/cancel
export type ScraperProgressCallback = (progress: ScraperProgress) => boolean;


export type ReplayErrorParams = {
    // The page being processed
    page: Page,
    // The caught exception
    err: unknown,
    // The event being processed
    event: AnyEvent,
    // All events in the processing list
    events: AnyEvent[],
    // All values collected so far
    values: ReplayResult,
}

// Attempt to handle an error.  If the error was handled gracefully,
// return the index of the event to continue from.  If the error was not
// handled gracefully, return undefined to stop the replay.
export type ReplayErrorCallback = (params: ReplayErrorParams) => Promise<number|undefined>;

export type IReplayCallbacks = {
  onError?: ReplayErrorCallback;
  onProgress?: ScraperProgressCallback;
}
