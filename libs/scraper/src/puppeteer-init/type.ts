import { Browser as BrowserType } from "@puppeteer/browsers"

declare global {
  var __browserType: BrowserType;
}

export function setBrowserType(type?: BrowserType) {
  const newType = (
    type ??
    process.env.THECOIN_SCRAPER_BROWSER as BrowserType ??
    BrowserType.CHROME
  );
  // If the type is the same, do nothing
  if (newType == globalThis.__browserType) {
    return;
  }
  // else if the type is different, throw an error
  if (globalThis.__browserType) {
    throw new Error("Browser type already set");
  }
  // Set the type
  globalThis.__browserType = newType;
}

export function getBrowserType(): BrowserType {
  if (!globalThis.__browserType) {
    // Init to default
    setBrowserType();
  }
  return globalThis.__browserType;
}

export function getPuppeteerType(): "chrome" | "firefox" {
  return getBrowserType() == BrowserType.CHROME ? "chrome" : "firefox";
}
