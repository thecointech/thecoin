import { Browser as BrowserType } from "@puppeteer/browsers"

declare global {
  var __browserType: BrowserType;
}

export function setBrowserType(type?: BrowserType) {
  if (globalThis.__browserType) {
    throw new Error("Browser type already set");
  }
  globalThis.__browserType = (
    type ??
    process.env.THECOIN_SCRAPER_BROWSER as BrowserType ??
    BrowserType.CHROME
  );
}

export function getBrowserType(): BrowserType {
  if (!globalThis.__browserType) {
    throw new Error("Scraping not initialized, BrowserType missing");
  }
  return globalThis.__browserType;
}

export function getPuppeteerType(): "chrome" | "firefox" {
  return getBrowserType() == BrowserType.CHROME ? "chrome" : "firefox";
}
