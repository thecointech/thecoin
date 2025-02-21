import { log } from "@thecointech/logging";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Page } from "puppeteer";
import type { SectionName } from "../../src/types";
import { isPresent } from "@thecointech/utilities/ArrayExtns";
import { doPixelMatch } from "../../src/vqaResponse";
import { IScraperCallbacks, ScraperProgress } from "@thecointech/scraper";
import { AnyEvent } from "@thecointech/scraper/types";

// How many pixels must change to consider it a new screenshot
const MIN_PIXELS_CHANGED = 100;

// Our data output is in the following format:
// (actually, it's not, but we will move to that)
// intent/  <-- What are we trying to do
//   page/  <-- For each navigation, write out the page
//     source/  <-- The source of the image
//       page.png <-- Every folder has a screenshot
//       page.mhtml
//       intent.json
//       {element-name}.json
//       {element-name}.json
//       ...

export class TestSerializer implements IScraperCallbacks {

  baseFolder: string

  // The bank names (constant throughout an execution)
  target: string

  // The intent (updates as we navigate)
  // intent: EventIntent

  _lastIntent: string | undefined;
  sectionCount = 0;
  _lastScreenShot: Uint8Array | Buffer | undefined;

  constructor({baseFolder, target}: {baseFolder: string, target: string}) {
    this.baseFolder = baseFolder
    this.target = target
  }

  async onError(page: Page, error: unknown, event?: AnyEvent) {
    log.error(error);
    // Dump errors here.
    return false;
  }

  async onProgress(progress: ScraperProgress) {
    log.info(`Progress: ${progress}`);
  }

  async onScreenshot(intent: string, screenshot: Buffer|Uint8Array, page: Page) {
    // Save screenshot
    this.maybeIncrementSection(intent, screenshot);
  }

  maybeIncrementSection(intent: string, screenshot: Buffer|Uint8Array) {
    if (intent != this._lastIntent) {
      this._lastIntent = intent;
      this.sectionCount = 0;
    } else {
      if (this._lastScreenShot) {
        if(doPixelMatch(screenshot, this._lastScreenShot) > MIN_PIXELS_CHANGED) {
          this.sectionCount++;
        };
      }
    }
    this._lastScreenShot = screenshot;
  }
  async logScreenshot(intent: SectionName, screenshot: Buffer|Uint8Array, page: Page): Promise<void> {
    // Save screenshot
    this.maybeIncrementSection(intent, screenshot);
    const outScFile = this.toPath(intent, `${this.sectionCount}`, "png");
    writeFileSync(outScFile, screenshot, { encoding: "binary" });

    // Also try for MHTML
    const outMhtml = this.toPath(intent, `${this.sectionCount}`, "mhtml");
    const cdp = await page.createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    writeFileSync(outMhtml, data);
  }

  async logJson(intent?: string, name?: string, data: any = {}): Promise<void> {
    const path = this.toPath(intent as SectionName, `${this.sectionCount}-${name}`, "json");
    writeFileSync(path, JSON.stringify(data, null, 2));
    log.trace(`Wrote: ${path}`);
  }

  async logEvents(events: any={}) {
    const path = this.toPath(undefined, "events", "json");
    writeFileSync(path, JSON.stringify(events, null, 2));
    log.trace(`Wrote EVents: ${path}`);
  }

  // async writeScreenshot(page: Page, state: TestState, fullPage: boolean = false) {
  //   // Save screenshot
  //   const outScFile = this.fromState(state, "png");
  //   const buffer = await page.screenshot({ type: 'png', fullPage });
  //   this.write(buffer, outScFile, { encoding: "binary" });

  //   // Also try for MHTML
  //   const outMhtml = this.fromState(state, "mhtml");
  //   const cdp = await page.createCDPSession();
  //   const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
  //   this.write(data, outMhtml);
  // }

  // writeJson(data: any, test: TestElement) {
  //   this.write(JSON.stringify(data, null, 2), this.fromElement(test));
  // }

  // fromState(state: TestState, format: string): OutputFilePath {
  //   return ({
  //     baseFolder: this.baseFolder,
  //     source: this.source,
  //     ...state,
  //     filename: `${this.source}.${format}`
  //   });
  // }
  // fromElement(test: TestElement): OutputFilePath {
  //   return ({
  //     baseFolder: this.baseFolder,
  //     source: this.source,
  //     ...test,
  //     filename: `${this.source}-${test.name}.json`
  //   });
  // }

  // write(data: any, out: OutputFilePath, options?: WriteFileOptions) {
  //   writeFileSync(toPath(out), data, options);
  //   log.trace(`Wrote: ${toPath(out)}`);
  // }

  toPath(section?: SectionName, name?: string, extn?: string) {
    const structure = [this.baseFolder, section, this.target]
    const outputFolder = path.join(...structure.filter(isPresent));
    mkdirSync(outputFolder, { recursive: true });
    return path.join(outputFolder, `${name}.${extn}`);
  }
}
