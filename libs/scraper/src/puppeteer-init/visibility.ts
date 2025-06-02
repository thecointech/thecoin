// Set scraper visibility.  There are many entry points
// for scraping sessions, and it became awkward to pass around
// parameters.  This file provides a single source of truth
// for visibility instead.

// If the app has persistent storage it can use a callback
// to provide this value to the scraper.  This is the
// least explicit option, but it is the most flexible.
type ScraperVisibilityCallback = () => Promise<boolean>;

declare global {
  var __visibilityCallback: ScraperVisibilityCallback;
  var __overrideVisible: number;
}

export function setIsVisible(callback: ScraperVisibilityCallback) {
  globalThis.__visibilityCallback = callback;
}

export async function getIsVisible() {
  // The most immediate option is anything that is triggered in code
  if (globalThis.__overrideVisible > 0) return true;
  // Next most immediate is anything that is set in the environment
  if (process.env.RUN_SCRAPER_VISIBLE === 'true') return true;
  if (process.env.RUN_SCRAPER_VISIBLE === 'false') return false;
  // Least explicit is any stored values.
  if (globalThis.__visibilityCallback) return globalThis.__visibilityCallback();
  // false defaults to the new headless mode
  return false;
}

// Set scraper visible for temporary
export class VisibleOverride implements Disposable {

  private visible?: boolean;

  constructor(visible?: boolean) {
    this.visible = visible;
    if (this.visible) {
      globalThis.__overrideVisible++;
    }
  }

  dispose() {
    if (this.visible) {
      globalThis.__overrideVisible--;
    }
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}
