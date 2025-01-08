import { Page } from "puppeteer";
import { AnyEvent } from "../../src/types";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { File } from '@web-std/file';

import { AxiosResponse } from "axios";
import { ElementResponse, PageType } from "@thecointech/vqa";
import { clickElement, responseToElement } from "./vqaResponse";
import { sleep } from "@thecointech/async";
import { GetIntentApi } from "@thecointech/apis/vqa";
import { String } from "lodash";

type ApiFn = (image: File) => Promise<AxiosResponse<ElementResponse>>

export class IntentWriter {
  baseFolder: string
  name: string
  intent: string
  state: string = "initial"

  page: Page
  currentPageImage: Buffer
  currentPageIntent: PageType;

  protected constructor(page: Page, baseFolder: string, name: string, intent: string) {
    this.page = page
    this.baseFolder = baseFolder
    this.name = name
    this.intent = intent
  }

  // This should be called after every navigation
  async setNewState(state: string) {
    this.state = state
    await this.saveScreenshot(true);
    await this.updatePageIntent()
  }

  // Functions for interacting with the webpage
  async tryClick<T extends object>(
    api: T,
    fnName: keyof {
      [K in keyof T as T[K] extends ApiFn ? K : never]: T[K]
    },
    elementName: string,
    thenWaitFor: number = 1000
  ) {
      //@ts-ignore Basically, the typechecking on fnName should guarantee this is correct
      const fn = api[fnName].bind(api);
      const { data: r } = await fn(this.getImage());
      const element = await responseToElement(this.page, r);
      if (element) {
        this.saveElement(element, elementName);
        await clickElement(this.page, element);
        await sleep(thenWaitFor);
        return true;
      }
  }

  async updatePageIntent() {
    const { data: intent } = await GetIntentApi().pageIntent(this.getImage());
    this.currentPageIntent = intent.type;
    return intent.type;
  }

  async updateScreenshotImage(fullPage: boolean = false, path?: string) {
    this.currentPageImage = await this.page.screenshot({ type: 'png', path, fullPage });
  }


  async saveScreenshot(fullPage: boolean = false) {
    // Save screenshot
    const outScFile = this.outputFilename(`${this.name}.png`);
    await this.updateScreenshotImage(fullPage, outScFile);
    // Also try for MHTML
    const outMhtml = this.outputFilename(`${this.name}.mhtml`);
    const cdp = await this.page.createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    writeFileSync(outMhtml, data);
  }


  saveElement(event: AnyEvent, eventName: string) {
    // Remove variable data
    const {
      timestamp,
      id,
      clickX,
      clickY,
      parsing,
      type,
      ...trimmed
    } = event as any;
    const toWrite = {
      intent: this.intent,
      ...trimmed,
    }
    // Add intent & write to disk
    const jsonFile = this.outputFilename(`${this.name}-${eventName}.json`)
    writeFileSync(jsonFile, JSON.stringify(toWrite, null, 2));
  }


  getImage() {
    if (!this.currentPageImage) {
      throw new Error("No image")
    }
    return screenshotToFile(this.currentPageImage)
  }
  outputFilename(name: string) {
    const outputFolder = path.join(this.baseFolder, this.intent, this.state);
    mkdirSync(outputFolder, { recursive: true });
    return path.join(outputFolder, name);
  }
}

// Create a simple object that matches what the API expects
export const screenshotToFile = (screenshot: Buffer) => {
  const copy = Buffer.from(screenshot);
  return new File([copy], "screenshot.png", { type: "image/png" });
}
