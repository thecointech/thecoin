import { log } from "@thecointech/logging";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "puppeteer";
import type { SectionName } from "./types";
import { isPresent } from "@thecointech/utilities/ArrayExtns";
import { doPixelMatch } from "@thecointech/scraper/utilities";
import { _getImage } from "./getImage";
import { LoginFailedError } from "./errors";
import { ApiCallEvent, bus } from "./eventbus";
import { EventBus } from "@thecointech/scraper/events/eventbus";
import type { AnyEvent, ElementSearchParams, FoundElement } from "@thecointech/scraper/types";
import type { TestSchData } from "@thecointech/scraper";
import { File } from "@web-std/file";

// How many pixels must change to consider it a new screenshot
const MIN_PIXELS_CHANGED = 100;

// Our data output is in the following format:
// target/  <-- The target being navigated (eg bank name)
//   section/  <-- The over-all section (eg login/sendTransfer etc)
//       0.png <-- Every folder has a screenshot
//       0.mhtml
//       0-0-apiCall-vqa.json  <-- VQA output
//       0-1-action-elm.json  <-- Element found in scraper
//       0-1-action-sch.json  <-- Search arguments for elm
//       1.png
//       1.mhtml
//       1-0-apiCall-vqa.json
//       ...

type SerializerOptions = {
  recordFolder: string,
  // The bank names (constant throughout an execution)
  target: string,
  skipSections?: SectionName[],
  // Used in replay - if true, we will take a screenshot
  // on every element found
  writeScreenshotOnElement?: boolean,
}
// This class can be used to write out the full
// execution of an agent to a folder
export class AgentSerializer implements Disposable {

  tracker: SectionTracker;
  _lastScreenShot: Uint8Array | Buffer | undefined;

  options: SerializerOptions;
  get recordFolder() { return this.options.recordFolder; }
  get target() { return this.options.target; }
  // By default, we skip the initial section
  get skipSections() { return this.options.skipSections ?? ["Initial"]; }
  get writeScreenshotOnElement() { return this.options.writeScreenshotOnElement; }

  constructor(options: SerializerOptions) {
    this.options = options;

    bus().onApiCall(this.onApiCall);
    bus().onSection(this.onSection);
    EventBus.get().onElement(this.onElement);

    // Init tracker to "Initial"
    this.tracker = new SectionTracker();
    this.tracker.setCurrentSection("Initial");
  }

  [Symbol.dispose]() {
    bus().offApiCall(this.onApiCall);
    bus().offSection(this.onSection);
    EventBus.get().offElement(this.onElement);
  }

  // Log every API call
  onApiCall = async (event: ApiCallEvent) => {
    if (this.pauseWriting()) {
      return;
    }
    if (this.skipWriting(event)) {
      return;
    }
    // Does the request include an image?
    const args = event.request;
    const image = args.find((arg) => arg instanceof File) as File;
    if (image) {
      // Save the image
      await this.logScreenshot(Buffer.from(await image.arrayBuffer()));
      // Remove the image from the args
      args.splice(args.indexOf(image), 1);
    }
    await this.logJson(`${event.apiName}-${event.method}-vqa`, {
      args,
      response: event.response?.data,
      error: event.error,
    });
  }

  onElement = async (found: FoundElement, search: ElementSearchParams) => {
    // Delete things that change too much
    const { frame, ...data } = { ...found.data };
    const { page, ...searchCopy } = {...search};
    // We split the logged data into 2, the elm
    // file is just the element data, and sch is
    // just the search data.
    const sch: TestSchData = {
      score: found.score,
      components: found.components,
      search: searchCopy,
    }

    // Log both JSON files with the same element number as they
    // represent a single step in the process
    await this.logJson(`${search.event.eventName}-elm`, data, false);
    await this.logJson(`${search.event.eventName}-sch`, sch);
    await this.logMhtml(search.page);
    if (this.writeScreenshotOnElement) {
      try {
        const image = await _getImage(search.page);
        await this.logScreenshot(image);
      }
      catch (e) {
        log.error(e, `Error taking screenshot for element ${search.event.eventName}`);
        // Not fatal, so continue
      }
    }
  }

  onSection = async (section: SectionName) => {
    this.tracker.setCurrentSection(section);
  }

  pauseWriting() {
    return this.skipSections.includes(this.tracker.currentSection);
  }

  skipWriting(event: ApiCallEvent) {
    if (event.method == "pageIntent") {
      // If this is the same as the last intent, skip it.
      const response = event.response?.data as { type: string };
      if (response.type == this.tracker.lastIntent) {
        return true;
      }
      this.tracker.lastIntent = response.type;
    }
    return false;
  }

  maybeIncrementSection(screenshot: Buffer|Uint8Array) {
    if (this.tracker.lastScreenshot) {
      if(doPixelMatch(screenshot, this.tracker.lastScreenshot) > MIN_PIXELS_CHANGED) {
        this.tracker.incrementStep();
      };
    }
    this.tracker.lastScreenshot = screenshot;
  }

  async logScreenshot(screenshot: Buffer|Uint8Array): Promise<void> {
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

  async logJson(name?: string, data: any = {}, increment: boolean = true): Promise<void> {
    if (this.pauseWriting()) {
      return;
    }
    const filename = `${this.tracker.step}-${this.tracker.elements}-${name}`;
    // Ensure we don't overwrite previous JSON files
    if (increment) {
      this.tracker.incrementElement();
    }
    const outFile = this.toPath(this.tracker.currentSection, filename, "json");
    writeFileSync(outFile, JSON.stringify(data, null, 2));
    const relativePath = path.relative(this.recordFolder, outFile);
    log.trace(`Wrote: ${relativePath}`);
  }

  async logEvents(events: any={}) {
    const outFile = this.toPath(undefined, "events", "json");
    writeFileSync(outFile, JSON.stringify(events, null, 2));
    const relativePath = path.relative(this.recordFolder, outFile);
    log.trace(`Wrote Events: ${relativePath}`);
  }

  toPath(section?: string, name?: string, extn?: string) {
    const structure = [this.recordFolder, this.target, section]
    const outputFolder = path.join(...structure.filter(isPresent));
    mkdirSync(outputFolder, { recursive: true });
    const suffix = [name, extn].filter(isPresent).join(".");
    return path.join(outputFolder, suffix);
  }

  async dumpError(page: Page, error: unknown, event?: AnyEvent) {
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
    await this.logScreenshot(image);
    await this.logJson("error-vqa", error.vqaResponse);
  }
}


class SectionTracker {
  currentSection: SectionName = "Initial";
  sectionCounters: Partial<Record<SectionName, {
    step: number;
    elements: number;
    lastScreenshot?: Uint8Array | Buffer;
  }>> = {};
  lastIntent?: string;

  get step() {
    return this.sectionCounters[this.currentSection]?.step ?? 0;
  }
  get elements() {
    return this.sectionCounters[this.currentSection]?.elements ?? 0;
  }

  get section() {
    return this.sectionCounters[this.currentSection]!;
  }

  set lastScreenshot(screenshot: Uint8Array | Buffer | undefined) {
    const section = this.sectionCounters[this.currentSection];
    if (section) {
      section.lastScreenshot = screenshot;
    }
  }

  get lastScreenshot() {
    return this.sectionCounters[this.currentSection]?.lastScreenshot;
  }

  setCurrentSection(section: SectionName) {
    this.currentSection = section;
    this.sectionCounters[section] = this.sectionCounters[section] ?? {
      step: 0,
      elements: 0,
    };
  }
  incrementStep() {
    const section = this.sectionCounters[this.currentSection];
    if (section) {
      section.step++;
      section.elements = 0;
    }
    this.lastIntent = undefined;
  }
  incrementElement() {
    const section = this.sectionCounters[this.currentSection];
    if (section) {
      section.elements++;
    }
  }
}
