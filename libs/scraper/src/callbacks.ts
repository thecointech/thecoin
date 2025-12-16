import type { AnyEvent } from "@thecointech/scraper-types";

export type ScraperProgress = {
  stage: string, // Name of the step
  step: number, // Index of the step in total
  total: number, // The total number of steps
  stepPercent?: number // The percentage the current step is complete
  event?: AnyEvent // Only filled out in replay
}

// Report progress, return false to stop/cancel
export type ScraperProgressCallback = (progress: ScraperProgress) => boolean;
