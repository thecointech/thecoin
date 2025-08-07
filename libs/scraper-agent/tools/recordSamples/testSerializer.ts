import { log } from "@thecointech/logging";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Page } from "puppeteer";
import type { SectionName } from "../../src/types";
import { isPresent } from "@thecointech/utilities/ArrayExtns";
import { doPixelMatch } from "../../src/vqaResponse";
import { IScraperCallbacks, ScraperProgress } from "@thecointech/scraper";
import { AnyEvent, ElementSearchParams, FoundElement } from "@thecointech/scraper/types";
import { _getImage, TakeScreenshotError } from "../../src/getImage";
import { maybeCloseModal } from "../../src/modal";
import { LoginFailedError } from "@/errors";
import { ApiCallEvent, bus } from "@/eventbus";
import { EventBus } from "@thecointech/scraper/events/eventbus";


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

  tracker: SectionTracker;
  _lastScreenShot: Uint8Array | Buffer | undefined;

  _skipSections: string[];

  constructor({baseFolder, target, skipSections}: {baseFolder: string, target: string, skipSections?: string[]}) {
    this._baseFolder = baseFolder
    this._target = target
    this._skipSections = skipSections ?? [];

    bus().onApiCall(this.onApiCall);
    bus().onSection(this.onSection);
    EventBus.get().onElement(this.onElement);

    // Init tracker to "Initial"
    this.tracker = new SectionTracker();
    this.tracker.setCurrentSection("Initial");
  }

  // Log every API call
  onApiCall = async (event: ApiCallEvent) => {
    if (this.pauseWriting()) {
      return;
    }
    // Does the request include an image?
    const args = event.request;
    const image = args.find((arg) => arg instanceof File) as File;
    if (image) {
      // Save the image
      await this.onScreenshot(Buffer.from(await image.arrayBuffer()));
      // Remove the image from the args
      args.splice(args.indexOf(image), 1);
    }
    await this.logJson(`${event.apiName}-${event.method}-vqa`, {
      args,
      response: event.response.data,
      error: event.error,
    });
  }

  onElement = async (element: FoundElement, search: ElementSearchParams) => {
    const toStore = {
      ...element,
      search: {
        ...search,
      }
    }
    delete toStore.element;
    delete toStore.search.page;

    await this.logJson(`${toStore.search.event.eventName}-elm`, toStore);
    await this.logMhtml(search.page);
  }

  onSection = async (section: SectionName) => {
    this.tracker.setCurrentSection(section);
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
    return true;
  }

  pauseWriting() {
    return this.tracker.currentSection == "Initial" || this._skipSections.includes(this.tracker.currentSection);
  }

  maybeIncrementSection(screenshot: Buffer|Uint8Array) {
    if (this.tracker.lastScreenshot) {
      if(doPixelMatch(screenshot, this.tracker.lastScreenshot) > MIN_PIXELS_CHANGED) {
        this.tracker.incrementStep();
      };
    }
    this.tracker.lastScreenshot = screenshot;
  }

  async onScreenshot(screenshot: Buffer|Uint8Array, page?: Page): Promise<void> {
    if (this.pauseWriting()) {
      return;
    }
    this.maybeIncrementSection(screenshot);

    // Write out the buffer
    const outScFile = this.toPath(this.tracker.currentSection, `${this.tracker.step}`, "png");
    writeFileSync(outScFile, screenshot, { encoding: "binary" });

    // Also try for MHTML
    // if (page) {
      // await this.logMhtml(page);
    // }
  }

  async logMhtml(page: Page) {
    try {
      const outMhtml = this.toPath(this.tracker.currentSection, `${this.tracker.step}`, "mhtml");
      const cdp = await page.createCDPSession();
      const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
      writeFileSync(outMhtml, data);
    }
    catch (e) {
      log.error(e, `Error taking MHTML for section ${this.tracker.currentSection}`);
      // This is a pain, but it happens - let's move on anyway
    }
  }

  async logJson(name?: string, data: any = {}): Promise<void> {
    if (this.pauseWriting()) {
      return;
    }
    const filename = `${this.tracker.step}-${this.tracker.elements}-${name}`;
    // Ensure we don't overwrite previous JSON files
    this.tracker.incrementElement();
    const path = this.toPath(this.tracker.currentSection, filename, "json");
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
    await this.onScreenshot(image, page);
    await this.logJson("error-vqa", error.vqaResponse);
  }
}


class SectionTracker {
  currentSection: string;
  sectionCounters: Record<string, {
    step: number;
    elements: number;
    lastScreenshot?: Uint8Array | Buffer;
  }> = {};

  get step() {
    return this.sectionCounters[this.currentSection].step;
  }
  get elements() {
    return this.sectionCounters[this.currentSection].elements;
  }

  get section() {
    return this.sectionCounters[this.currentSection];
  }

  set lastScreenshot(screenshot: Uint8Array | Buffer) {
    this.sectionCounters[this.currentSection].lastScreenshot = screenshot;
  }

  get lastScreenshot() {
    return this.sectionCounters[this.currentSection].lastScreenshot;
  }

  setCurrentSection(section: string) {
    this.currentSection = section;
    this.sectionCounters[section] = this.sectionCounters[section] ?? {
      step: 0,
      elements: 0,
    };
  }
  incrementStep() {
    this.section.step++;
    this.section.elements = 0;
  }
  incrementElement() {
    this.section.elements++;
  }
}
