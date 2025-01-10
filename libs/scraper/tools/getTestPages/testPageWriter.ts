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
    const intent = await this.updatePageIntent()
    // Save out the inferred intent when loading the page
    // (This may be different from the stated intent)
    this.saveJson({
      intent,
    }, "intent");
  }

  async getImage(fullPage: boolean = false) {
    return await getImage(this.page, fullPage);
  }

  async updatePageIntent() {
    this.currentPageIntent = await getPageIntent(this.page);
    return this.currentPageIntent;
  }

  // Functions for interacting with the webpage
  async tryClick<T extends object>(api: T, fnName: ApiFnName<T>, elementName: string, htmlType: string = "", thenWaitFor: number = 3000, fullPage: boolean = false) {
    return await this.doInteraction(api, fnName, elementName, (found) => clickElement(this.page, found), htmlType, thenWaitFor, fullPage);
  }

  // Functions for interacting with the webpage
  async tryEnterText<T extends object>(api: T, fnName: ApiFnName<T>, text: string, elementName: string, htmlType: string = "input", thenWaitFor: number = 3000, fullPage: boolean = false) {
    return await this.doInteraction(api, fnName, elementName, (found) => enterValueIntoFound(this.page, found, text), htmlType, thenWaitFor, fullPage);
  }

  async doInteraction<T extends object>(
    api: T,
    fnName: ApiFnName<T>,
    elementName: string,
    interaction: (found: FoundElement) => Promise<void>,
    htmlType: string = "",
    thenWaitFor: number = 3000,
    fullPage: boolean = false
  ) {
    // Always get the latest screenshot
    const image = await getImage(this.page, fullPage);
    const { data: r } = await (api[fnName] as ApiFn)(image);
    return await this.completeInteraction(r, elementName, interaction, htmlType, thenWaitFor);
  }

  async completeInteraction(r: ElementResponse, elementName: string, interaction: (found: FoundElement) => Promise<void>, htmlType: string = "", thenWaitFor: number = 3000) {
    const found = await responseToElement(this.page, r, htmlType);
    if (found) {
      this.saveElement(found.data, elementName);
      await interaction(found);
      await sleep(thenWaitFor);
      return true;
    }
  }

  async saveScreenshot(fullPage: boolean = false) {
    // Save screenshot
    const outScFile = this.outputFilename(`${this.name}.png`);
    await this.page.screenshot({ type: 'png', fullPage, path: outScFile });

    // Also try for MHTML
    const outMhtml = this.outputFilename(`${this.name}.mhtml`);
    const cdp = await this.page.createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    writeFileSync(outMhtml, data);

    log.trace(`Page screenshot saved to: ${outScFile}`);
  }


  saveElement(data: ElementData, eventName: string) {
    // Remove variable data
    const {
      frame,
      ...trimmed
    } = data;
    this.saveJson({
      intent: this.intent,
      ...trimmed,
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

export async function getImage(page: Page, fullPage: boolean = false, path?: string) {
  const screenshot = await page.screenshot({ type: 'png', fullPage, path });
  return new File([screenshot], "screenshot.png", { type: "image/png" });
}


export async function getPageIntent(page: Page) {
  const image = await getImage(page);
  const { data: intent } = await GetIntentApi().pageIntent(image);
  log.trace(`Page detected as type: ${intent.type}`);
  return intent.type;
}
