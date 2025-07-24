import { log } from "@thecointech/logging";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Page } from "puppeteer";
import type { SectionName } from "../../src/types";
import { isPresent } from "@thecointech/utilities/ArrayExtns";
import { doPixelMatch } from "../../src/vqaResponse";
import { IScraperCallbacks, ScraperProgress } from "@thecointech/scraper";
import { AnyEvent } from "@thecointech/scraper/types";
import { _getImage, TakeScreenshotError } from "../../src/getImage";
import { maybeCloseModal } from "../../src/modal";
import { LoginFailedError } from "../../src/errors";

// How many pixels must change to consider it a new screenshot
const MIN_PIXELS_CHANGED = 100;

// Our data output is in the following format:
// target/  <-- The target being navigated (eg bank name)
//   section/  <-- The over-all section (eg login/sendTransfer etc)
//       0.png <-- Every folder has a screenshot
//       0.mhtml
//       0-action-vqa.json  <-- VQA output
//       0-action-elm.json  <-- Element found in scraper
//       1.png
//       1.mhtml
//       1-etc-vqa.json
//       ...

export class TestSerializer implements IScraperCallbacks {

  _baseFolder: string

  // The bank names (constant throughout an execution)
  _target: string

  _lastsection: string | undefined;
  sectionCount = 0;
  _lastScreenShot: Uint8Array | Buffer | undefined;

  _skipSections: string[];

  constructor({baseFolder, target, skipSections}: {baseFolder: string, target: string, skipSections?: string[]}) {
    this._baseFolder = baseFolder
    this._target = target
    this._skipSections = skipSections ?? [];
  }

  async onError(page: Page, error: unknown, event?: AnyEvent) {
    try {
      if (error instanceof TakeScreenshotError) {
        log.info(`Skipping screenshot due to error: ${error.message}`);
        return false;
      }
      else if (error instanceof LoginFailedError) {
        // This is part of the test, record it, but let the
        // error propagate
        await this.logFailedLogin(page, error);
        return false;
      }

      // If this is a modal, try and handle it automatically
      const modalClosed = await maybeCloseModal(page);
      if (modalClosed) {
        log.info(`Modal closed`);
        return true;
      }

      await this.dumpError(page, error, event);
    }
    catch (e) {
      log.error(e, `Error dumping page in onError`);
    }
    return false;
  }

  onProgress(progress: ScraperProgress) {
    log.info(`Progress: ${progress.stage} - ${progress.stepPercent}%`);
    // if we are starting a new section, reset the section count
    // This is always called with 0 percent at the start of a new section
    if (progress.stepPercent == 0 || progress.stage != this._lastsection) {
      this.sectionCount = 0;
      this._lastsection = progress.stage;
      this._lastScreenShot = undefined;
    }
    return true;
  }

  maybeIncrementSection(section: string, screenshot: Buffer|Uint8Array) {
    if (this._skipSections.includes(section)) {
      return;
    }

    if (this._lastScreenShot) {
      if(doPixelMatch(screenshot, this._lastScreenShot) > MIN_PIXELS_CHANGED) {
        this.sectionCount++;
      };
    }
    this._lastScreenShot = screenshot;
  }

  async onScreenshot(section: string, screenshot: Buffer|Uint8Array, page: Page): Promise<void> {
    if (this._skipSections.includes(section)) {
      return;
    }
    this.maybeIncrementSection(section, screenshot);

    // Write out the buffer
    const outScFile = this.toPath(section, `${this.sectionCount}`, "png");
    writeFileSync(outScFile, screenshot, { encoding: "binary" });

    // Also try for MHTML
    try {
      const outMhtml = this.toPath(section, `${this.sectionCount}`, "mhtml");
      const cdp = await page.createCDPSession();
      const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
      writeFileSync(outMhtml, data);
    }
    catch (e) {
      log.error(e);
      // This is a pain, but it happens - let's move on anyway
    }
  }

  async logJson(section?: string, name?: string, data: any = {}): Promise<void> {
    if (section && this._skipSections.includes(section)) {
      return;
    }
    const path = this.toPath(section, `${this.sectionCount}-${name}`, "json");
    writeFileSync(path, JSON.stringify(data, null, 2));
    log.trace(`Wrote: ${path}`);
  }

  async logEvents(events: any={}) {
    const path = this.toPath(undefined, "events", "json");
    writeFileSync(path, JSON.stringify(events, null, 2));
    log.trace(`Wrote Events: ${path}`);
  }

  toPath(section?: string, name?: string, extn?: string) {
    const structure = [this._baseFolder, this._target, section]
    const outputFolder = path.join(...structure.filter(isPresent));
    mkdirSync(outputFolder, { recursive: true });
    const suffix = [name, extn].filter(isPresent).join(".");
    return path.join(outputFolder, suffix);
  }

  async dumpError(page: Page, error: unknown, event: AnyEvent) {
    const dumpFolder = this.toPath("error")
    mkdirSync(dumpFolder, { recursive: true });

    // We don't know what the error is, save out the page and debug it.
    await page.screenshot({ path: path.join(dumpFolder, "error.png"), type: "png" });
    // Save content might be helpful
    const content = await page.content();
    writeFileSync(path.join(dumpFolder, `error.html`), content);
    // Lastly, try for MHTML
    const cdp = await page.createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    writeFileSync(path.join(dumpFolder, `error.mhtml`), data);

    // write the error out too, if possible
    writeFileSync(path.join(dumpFolder, `error.json`), JSON.stringify(error));
    if (event) {
      writeFileSync(path.join(dumpFolder, `event.json`), JSON.stringify(event));
    }
  }

  async logFailedLogin(page: Page, error: LoginFailedError) {
    const image = await _getImage(page);
    await this.onScreenshot("Login", image, page);
    await this.logJson("Login", "error-vqa", error.vqaResponse);
  }
}
