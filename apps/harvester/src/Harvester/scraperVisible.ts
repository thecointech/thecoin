import { getProcessConfig, setProcessConfig } from "./config";
import type { ScraperVisibility } from "@thecointech/scraper/puppeteer-init/visibility";

// The scraper has a few different input points around.
// We want to the visibility switch to be a single source of truth

export async function getScraperMode(): Promise<ScraperVisibility> {
  const config = await getProcessConfig();
  return config?.scraperVisibilityMode ?? 'headless';
}

export async function setScraperMode(mode: ScraperVisibility) {
  await setProcessConfig({ scraperVisibilityMode: mode });
}
