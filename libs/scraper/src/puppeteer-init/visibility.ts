// Set scraper visibility.  There are many entry points
// for scraping sessions, and it became awkward to pass around
// parameters.  This file provides a single source of truth
// for visibility instead.
//
// Three modes are supported:
//  - headless: no window at all (fast, but detectable by anti-bot systems)
//  - offscreen: a real headed browser with the window positioned off-screen.
//    Near-identical fingerprint to "visible", without showing the user anything.
//  - visible: a normal headed browser window.

export type ScraperVisibility = 'headless' | 'offscreen' | 'visible';

// If the app has persistent storage it can use a callback
// to provide this value to the scraper.  This is the
// least explicit option, but it is the most flexible.
export type ScraperVisibilityCallback = () => Promise<ScraperVisibility>;

declare global {
  var __visibilityCallback: ScraperVisibilityCallback|undefined;
  var __overrideVisible: ScraperVisibility[];
}

export function setIsVisible(callback?: ScraperVisibilityCallback) {
  globalThis.__visibilityCallback = callback;
}

function parseMode(v?: string): ScraperVisibility | undefined {
  return (v === 'headless' || v === 'offscreen' || v === 'visible')
    ? v
    : undefined;
}

export async function getVisibilityMode(): Promise<ScraperVisibility> {
  // The most immediate option is anything that is triggered in code
  const overrides = globalThis.__overrideVisible;
  if (overrides?.length) return overrides[overrides.length - 1];
  // Next most immediate is anything that is set in the environment
  const envMode = parseMode(process.env.RUN_SCRAPER_MODE);
  if (envMode) return envMode;
  if (process.env.RUN_SCRAPER_VISIBLE === 'true') return 'visible';
  if (process.env.RUN_SCRAPER_VISIBLE === 'false') return 'headless';
  // Least explicit is any stored values.
  if (globalThis.__visibilityCallback) return await globalThis.__visibilityCallback();
  // false defaults to the new headless mode
  return 'headless';
}

export async function getIsVisible() {
  return (await getVisibilityMode()) === 'visible';
}

// Set scraper visible for temporary
export class VisibleOverride implements Disposable {

  private mode?: ScraperVisibility;

  constructor(visible?: ScraperVisibility) {
    this.mode = visible;
    if (this.mode) {
      const overrides = (globalThis.__overrideVisible ??= []);
      overrides.push(this.mode);
    }
  }

  dispose() {
    const mode = this.mode;
    this.mode = undefined;
    if (mode) {
      const overrides = globalThis.__overrideVisible;
      const idx = overrides?.lastIndexOf(mode) ?? -1;
      if (idx >= 0) overrides.splice(idx, 1);
    }
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}
