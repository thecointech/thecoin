import { Page } from "puppeteer";
import { File } from '@web-std/file';
import type { AxiosResponse } from "axios";
import { clickElement, responseToElement } from "./vqaResponse";
import { sleep } from "@thecointech/async";
import { GetIntentApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { enterValueIntoFound } from "../../src/replay";
import { FoundElement } from "../../src/elements";
import { ITestSerializer, TestState } from "./testSerializer";
import { DateTime } from "luxon";
import type { ElementResponse, ProcessConfig } from "./types";
import type { IAskUser } from "./askUser";

type ApiFn = (image: File) => Promise<AxiosResponse<ElementResponse>>

type ApiFnName<T> = keyof {
  [K in keyof T as T[K] extends ApiFn ? K : never]: T[K]
}

export class IntentWriter {

  page: Page
  writer: ITestSerializer
  askUser: IAskUser

  state: TestState;

  lastNavigateTime = Date.now();

  protected constructor(config: ProcessConfig, intent: string) {
    this.page = config.recorder.getPage();
    this.writer = config.writer
    this.askUser = config.askUser
    this.state = {
      intent,
      page: ""
    }

    this.page.on('load', () => {
      this.lastNavigateTime = Date.now();
    });
    this.page.on('domcontentloaded', () => {
      this.lastNavigateTime = Date.now();
    });
  }

  async initialize() {
    // Ensure we have been initialized
    if (!this.state.page) {
      await this.updatePageName("initial");
    }
  }

  // This should be called after every navigation
  async updatePageName(name: string) {
    this.state.page = name
    await this.writeScreenshot();
    const intent = await this.getPageIntent()
    // Save out the inferred intent when loading the page
    // (This may be different from the stated intent)
    this.writeJson({
      intent,
    }, "intent");
  }

  async getImage(fullPage: boolean = false) {
    await this.initialize();
    return await _getImage(this.page, fullPage);
  }

  async getPageIntent() {
    // TODO: WE really need polly instead of hard-coded attempts for this
    for (let i = 0; i < 5; i++) {
      try {
        return await _getPageIntent(this.page);
      }
      catch (e) {
        log.error(`Couldn't get page intent: ${e}`);
      }
      await sleep(1000);
    }
  }

  // Functions for interacting with the webpage
  async tryClick<T extends object>(api: T, fnName: ApiFnName<T>, elementName: string, htmlType = "button", inputType: string = undefined, thenWaitFor = 3000, fullPage = false) {
    // It may not be a navigation, but if it does trigger a navigation this
    // will help us await it.
    this.lastNavigateTime = Date.now();
    return await this.doInteraction(api, fnName, elementName, (found) => clickElement(this.page, found), htmlType, inputType, thenWaitFor, fullPage);
  }

  // Functions for interacting with the webpage
  async tryEnterText<T extends object>(api: T, fnName: ApiFnName<T>, text: string, elementName: string, htmlType = "input", inputType = "text", thenWaitFor = 3000, fullPage = false) {
    return await this.doInteraction(api, fnName, elementName, (found) => enterValueIntoFound(this.page, found, text), htmlType, inputType, thenWaitFor, fullPage);
  }

  async doInteraction<T extends object>(
    api: T,
    fnName: ApiFnName<T>,
    elementName: string,
    interaction: (found: FoundElement) => Promise<void>,
    htmlType = "",
    inputType: string = undefined,
    thenWaitFor = 3000,
    fullPage = false
  ) {
    // Always get the latest screenshot
    const image = await this.getImage(fullPage);
    const { data: r } = await (api[fnName] as ApiFn)(image);
    return await this.completeInteraction(r, elementName, interaction, htmlType, inputType, thenWaitFor);
  }

  async completeInteraction(r: ElementResponse, elementName: string, interaction: (found: FoundElement) => Promise<void>, htmlType = "", inputType: string = undefined, thenWaitFor = 3000) {
    try {
      const found = await this.toElement(r, elementName,htmlType, inputType);
      await interaction(found);
      await sleep(thenWaitFor);
      return true;
    } catch (e) {
      // Save out page/JSON to allow easy debugging
      const debugState = {
        intent: "debug",
        page: `${elementName}-${DateTime.now().toFormat("yyyy-MM-dd-HH-mm-ss")}`,
        name: elementName
      };
      await this.writer.writeScreenshot(this.page, debugState);
      this.writer.writeJson(r, debugState);
      throw e;
    }
  }

  async waitForPageLoaded() {

    // Poll for navigation happening
    await this.waitForNavigationStable();

    // Now wait for the page to settle down
    const aborter = new AbortController();
    return Promise.all([
      this.waitForPageStable(aborter.signal),
      this.waitForNetworkIdle(aborter.signal)
    ])
  }

  async waitForNavigationStable(pollInterval = 2000) {
    let lastUrl = this.page.url();
    do {
      await sleep(pollInterval);
      const currentUrl = this.page.url();
      if (currentUrl !== lastUrl) {
        this.lastNavigateTime = Date.now();
        lastUrl = currentUrl;
      }
    } while (Date.now() < this.lastNavigateTime + pollInterval);
  }

  async waitForPageStable(signal: AbortSignal, timeout = 5000) {
    try {
      let initialContent = await this.page.content();
      let contentChanged = true;
      let maxTime = Date.now() + timeout;

      while (Date.now() < maxTime && signal?.aborted === false) {
        await sleep(500); // Check every 250ms
        const newContent = await this.page.content();
        contentChanged = initialContent !== newContent;
        initialContent = newContent;
      }
      log.trace(`Page stable after ${maxTime - Date.now()}ms`);
    }
    catch (error) {
      log.debug("Error waiting for page to be stable", error);
    }
  }

  async waitForNetworkIdle(signal: AbortSignal, timeout = 5000) {
    const maxTime = Date.now() + timeout;
    try {
      await this.page.waitForNetworkIdle({ idleTime: 500, timeout });
      log.trace(`Network idle after ${maxTime - Date.now()}ms`);
    } catch (error) {
      log.debug("Error waiting for network to be idle", error);
    }
  }

  async toElement(response: ElementResponse, eventName: string, htmlType?: string, inputType?: string, extra?: any) {
    // First, record the response from the API
    this.writeJson(response, `vqa-${eventName}`);
    // Find the element in the page
    const found = await responseToElement(this.page, response, htmlType, inputType);
    if (!found) {
      throw new Error("Failed to find element for " + eventName);
    }
    // Finally, record what we found
    this.writeJson({
      ...found.data,
      ...(extra ? { extra } : {})
    }, eventName);
    return found;
  }

  writeScreenshot = () => this.writer.writeScreenshot(this.page, this.state);
  writeJson = (data: any, eventName: string) => this.writer.writeJson(data, { ...this.state, name: eventName });
}

export async function _getImage(page: Page, fullPage: boolean = false, path?: string) {
  const screenshot = await page.screenshot({ type: 'png', fullPage, path });
  return new File([screenshot], "screenshot.png", { type: "image/png" });
}

export async function _getPageIntent(page: Page) {
  const image = await _getImage(page);
  const { data: intent } = await GetIntentApi().pageIntent(image);
  log.trace(`Page detected as type: ${intent.type}`);
  return intent.type;
}
