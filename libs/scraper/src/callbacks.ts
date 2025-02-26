import type { Page } from "puppeteer";
import type { AnyEvent } from "./types";

export type ScraperProgress = {
  stage: string, // Name of the step
  step: number, // Index of the step in total
  total: number, // The total number of steps
  stepPercent?: number // The percentage the current step is complete
}

export type ScraperProgressCallback = (progress: ScraperProgress) => void;
export type IScraperCallbacks = {
  onError?: (page: Page, error: unknown, event?: AnyEvent) => Promise<boolean>;
  onProgress?: ScraperProgressCallback;
  onScreenshot?: (section: string, screenshot: Buffer|Uint8Array, page: Page) => Promise<void>;

  // Used in record only...
  logJson?: (section: string, name: string, data: any) => void;
}
