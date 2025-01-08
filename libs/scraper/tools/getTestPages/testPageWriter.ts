import { Page } from "puppeteer";
import { ElementData } from "../../src/types";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { File } from '@web-std/file';

import { AxiosResponse } from "axios";
import { ElementResponse, PageType } from "@thecointech/vqa";
import { clickElement, responseToElement } from "./vqaResponse";
import { sleep } from "@thecointech/async";
import { GetIntentApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { enterValueIntoFound } from "../../src/replay";
import { FoundElement } from "../../src/elements";

type ApiFn = (image: File) => Promise<AxiosResponse<ElementResponse>>

type ApiFnName<T> = keyof {
  [K in keyof T as T[K] extends ApiFn ? K : never]: T[K]
}

export class IntentWriter {

  static baseFolder: string
  name: string
  intent: string
  state: string = "initial"

  page: Page
  // currentPageImage: Buffer
  currentPageIntent: PageType;

  protected constructor(page: Page, name: string, intent: string) {
    this.page = page
    this.name = name
    this.intent = intent
  }

  // This should be called after every navigation
  async setNewState(state: string) {
    this.state = state
    await this.saveScreenshot();
    await this.updatePageIntent()
  }

  // Functions for interacting with the webpage
  async tryClick<T extends object>(api: T, fnName: ApiFnName<T>, elementName: string, thenWaitFor: number = 3000, fullPage: boolean = false) {
    return await this.doInteraction(api, fnName, elementName, (found) => clickElement(this.page, found), thenWaitFor, fullPage);
  }

  // Functions for interacting with the webpage
  async tryEnterText<T extends object>(api: T, fnName: ApiFnName<T>, text: string, elementName: string, thenWaitFor: number = 3000, fullPage: boolean = false) {
    return await this.doInteraction(api, fnName, elementName, (found) => enterValueIntoFound(this.page, found, text), thenWaitFor, fullPage);
  }

  async doInteraction<T extends object>(
    api: T,
    fnName: ApiFnName<T>,
    elementName: string,
    interaction: (found: FoundElement) => Promise<void>,
    thenWaitFor: number = 3000,
    fullPage: boolean = false
  ) {
    // Always get the latest screenshot
    const image = await this.getImage(fullPage);
    const { data: r } = await (api[fnName] as ApiFn)(image);
    return await this.completeInteraction(r, elementName, interaction, thenWaitFor);
  }

  async completeInteraction(r: ElementResponse, elementName: string, interaction: (found: FoundElement) => Promise<void>, thenWaitFor: number = 3000) {
    const found = await responseToElement(this.page, r);
    if (found) {
      this.saveElement(found.data, elementName);
      await interaction(found);
      await sleep(thenWaitFor);
      return true;
    }
  }

  async updatePageIntent() {
    const image = await this.getImage();
    const { data: intent } = await GetIntentApi().pageIntent(image);
    this.currentPageIntent = intent.type;
    log.trace(`Page detected as type: ${intent.type}`);
    return intent.type;
  }

  async saveScreenshot(fullPage: boolean = false) {
    // Save screenshot
    const outScFile = this.outputFilename(`${this.name}.png`);
    const screenshot = await this.page.screenshot({ type: 'png', fullPage });
    writeFileSync(outScFile, screenshot);
    // Also try for MHTML
    const outMhtml = this.outputFilename(`${this.name}.mhtml`);
    const cdp = await this.page.createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    writeFileSync(outMhtml, data);

    log.trace(`Page screenshot saved to: ${outScFile}`);
  }


  saveElement(data: ElementData, eventName: string) {
    // Remove variable data
    this.saveJson({
      intent: this.intent,
      ...data,
    }, eventName)
  }

  saveJson(data: any, eventName: string) {
    // Add intent & write to disk
    const jsonFile = this.outputFilename(`${this.name}-${eventName}.json`)
    writeFileSync(jsonFile, JSON.stringify(data, null, 2));
    log.trace(`Element data saved to: ${jsonFile}`);
  }


  waitForPageLoaded() {
    // different loading thingies
    const aborter = new AbortController();
    return Promise.all([
      this.waitForPageStable(10000, aborter.signal),
      this.waitForNetworkIdle(10000, aborter.signal)
    ])
  }

  async waitForPageStable(timeout = 5000, signal: AbortSignal) {
    try {
      let initialContent = await this.page.content();
      let contentChanged = true;
      let maxTime = Date.now() + timeout;

      while (Date.now() < maxTime && signal?.aborted === false) {
        await sleep(250); // Check every 250ms
        const newContent = await this.page.content();
        contentChanged = initialContent !== newContent;
        initialContent = newContent;
      }
    }
    catch (error) {
      console.log("Error waiting for page to be stable", error);
    }
  }

  async waitForNetworkIdle(timeout = 5000, _signal: AbortSignal) {
    const maxTime = Date.now() + timeout;
    try {
      await this.page.waitForNetworkIdle({ idleTime: 500, timeout });
    } catch (error) {}
  }


  async getImage(fullPage: boolean = false, path?: string) {
    const screenshot = await this.page.screenshot({ type: 'png', fullPage, path });
    return new File([screenshot], "screenshot.png", { type: "image/png" });
  }
  outputFilename(name: string) {
    const outputFolder = path.join(IntentWriter.baseFolder, this.intent, this.state);
    mkdirSync(outputFolder, { recursive: true });
    return path.join(outputFolder, name);
  }
}

// Create a simple object that matches what the API expects
// export const screenshotToFile = (screenshot: Buffer) => {
//   const copy = Buffer.from(screenshot);
//   return new File([copy], "screenshot.png", { type: "image/png" });
// }
