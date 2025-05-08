
export class ToggleShowBrowser implements Disposable {
  oldHeadless: string | undefined;
  constructor(visible: boolean) {
    this.oldHeadless = process.env.RUN_SCRAPER_HEADLESS;
    process.env.RUN_SCRAPER_HEADLESS = visible ? "false" : "true";
  }

  [Symbol.dispose]() {
    process.env.RUN_SCRAPER_HEADLESS = this.oldHeadless;
  }
}
