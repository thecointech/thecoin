import { Page, TimeoutError } from "puppeteer";
import { File } from '@web-std/file';
import type { AxiosResponse } from "axios";
import { AnyResponse, clickElement, responseToElement } from "./vqaResponse";
import { sleep } from "@thecointech/async";
import { GetIntentApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { enterValueIntoFound } from "../../src/replay";
import { FoundElement } from "../../src/elements";
import { ITestSerializer, TestState } from "./testSerializer";
import { DateTime } from "luxon";
import type { ProcessConfig } from "./types";
import type { IAskUser } from "./askUser";

type ApiFn = (image: File) => Promise<AxiosResponse<AnyResponse>>

type ApiFnName<T> = keyof {
  [K in keyof T as T[K] extends ApiFn ? K : never]: T[K]
}

type InteractionOptions = {
  name: string
  htmlType?: string
  inputType?: string
  fullPage?: boolean
}

type ClickInteractionOptions = InteractionOptions & {
  noNavigate?: boolean,
  minPixelsChanged?: number
}

type InputInteractionOptions = InteractionOptions & {
  text: string
}

export class IntentWriter {

  page: Page
  writer: ITestSerializer
  askUser: IAskUser

  state: TestState;

  // lastNavigateTime = Date.now();

  protected constructor(config: ProcessConfig, intent: string) {
    this.page = config.recorder.getPage();
    this.writer = config.writer
    this.askUser = config.askUser
    this.state = {
      intent,
      page: ""
    }

    // this.page.on('load', () => {
    //   this.lastNavigateTime = Date.now();
    // });
    // this.page.on('domcontentloaded', () => {
    //   this.lastNavigateTime = Date.now();
    // });
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
  async tryClick<T extends object>(api: T, fnName: ApiFnName<T>, options: ClickInteractionOptions) {
    // It may not be a navigation, but if it does trigger a navigation this
    // will help us await it.
    return await this.doInteraction(api, fnName, (found) => clickElement(this.page, found, options.noNavigate, options.minPixelsChanged), options);
  }

  // Functions for interacting with the webpage
  async tryEnterText<T extends object>(api: T, fnName: ApiFnName<T>, options: InputInteractionOptions) {
    return await this.doInteraction(api, fnName, (found) => enterValueIntoFound(this.page, found, options.text), options);
  }

  async doInteraction<T extends object>(
    api: T,
    fnName: ApiFnName<T>,
    interaction: (found: FoundElement) => Promise<boolean>,
    options: InteractionOptions,
  ) {
    // Always get the latest screenshot
    const image = await this.getImage(options.fullPage);
    const { data: r } = await (api[fnName] as ApiFn)(image);
    return await this.completeInteraction(r, interaction, options);
  }

  async completeInteraction(r: AnyResponse, interaction: (found: FoundElement) => Promise<boolean>, options: InteractionOptions) {
    try {
      const found = await this.toElement(r, options.name, options.htmlType, options.inputType);
      return await interaction(found);
    } catch (e) {
      // Save out page/JSON to allow easy debugging
      const debugState = {
        intent: "debug",
        page: `${options.name}-${DateTime.now().toFormat("yyyy-MM-dd-HH-mm-ss")}`,
        name: options.name
      };
      await this.writer.writeScreenshot(this.page, debugState);
      this.writer.writeJson(r, debugState);
      throw e;
    }
  }

  // async waitForPageLoaded() {

  //   // Poll for navigation happening
  //   await this.waitForNavigationStable();

  //   // Now wait for the page to settle down
  //   const aborter = new AbortController();
  //   return Promise.all([
  //     this.waitForPageStable(aborter.signal),
  //     this.waitForNetworkIdle(aborter.signal)
  //   ])
  // }

  // async waitForNavigationStable(pollInterval = 2000, timeout = 10_000) {
  //   const maxTime = Date.now() + timeout;
  //   let lastUrl = this.page.url();
  //   do {
  //     await sleep(pollInterval);
  //     const currentUrl = this.page.url();
  //     if (currentUrl !== lastUrl) {
  //       // Last navigate time will be updated whenever a page is loaded
  //       // But we might catch a URL change a little earlier than that
  //       this.lastNavigateTime = Date.now();
  //       lastUrl = currentUrl;
  //     }
  //   } while (Date.now() < this.lastNavigateTime + pollInterval && Date.now() < maxTime);
  // }

  // async waitForPageStable(signal: AbortSignal, timeout = 5000) {
  //   try {
  //     let initialContent = await this.page.content();
  //     let contentChanged = true;
  //     const initTime = Date.now();
  //     let maxTime = Date.now() + timeout;

  //     while (Date.now() < maxTime && signal?.aborted === false) {
  //       await sleep(500); // Check every 250ms
  //       const newContent = await this.page.content();
  //       contentChanged = initialContent !== newContent;
  //       initialContent = newContent;
  //     }
  //     log.trace(`Page stable after ${Date.now() - initTime}ms`);
  //   }
  //   catch (error) {
  //     log.debug("Error waiting for page to be stable", error);
  //   }
  // }

  async waitForNetworkIdle(signal: AbortSignal, timeout = 5000) {
    const initTime = Date.now();
    const maxTime = initTime + timeout;
    try {
      await this.page.waitForNetworkIdle({ concurrency: 2, idleTime: 500, timeout });
      log.trace(`Network idle after ${Date.now() - initTime}ms`);
    } catch (error) {
      if (!(error instanceof TimeoutError)) {
        log.debug("Error waiting for network to be idle", error);
      }
    }
  }

  async toElement(response: AnyResponse, eventName: string, htmlType?: string, inputType?: string, extra?: any) {
    // First, record the response from the API
    this.writeJson(response, `vqa-${eventName}`);
    // Find the element in the page
    const found = await responseToElement(this.page, response, htmlType, inputType);
    if (!found) {
      throw new Error("Failed to find element for " + eventName);
    }
    // Finally, record what we found
    // Do not include data that is likely to change
    const { frame, ...trimmed } = found.data;
    this.writeJson({
      ...trimmed,
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
