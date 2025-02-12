import type { AxiosResponse } from "axios";
import { AnyResponse, clickElement, responseToElement } from "./vqaResponse";
import { sleep } from "@thecointech/async";
import { log } from "@thecointech/logging";
import { enterValueIntoFound } from "@thecointech/scraper/replay";
import { FoundElement, ValueEvent, ValueType } from "@thecointech/scraper/types";
import { Recorder, Registry } from "@thecointech/scraper/record";
import { getValueParsing } from "@thecointech/scraper/valueParsing";
import { EventManager, IEventSectionManager } from "./eventManager";
import { _getImage } from "./getImage";
import { _getPageIntent } from "./getPageIntent";
import { ElementResponse } from "@thecointech/vqa";
import { IAgentLogger } from "./types";
import crypto from "node:crypto";
import { File } from "@web-std/file";
import { SectionType } from "./processors/types";

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

export class PageHandler {

  name: string;
  recorderStack: Recorder[]
  eventManager: EventManager
  logger?: IAgentLogger

  get recorder() {
    return this.recorderStack.at(-1)!
  }
  get page() {
    return this.recorder.page;
  }
  get currentSection() {
    return this.eventManager.currentSection;
  }
  get currentSectionName() {
    return this.currentSection.section;
  }
  get allEvents() {
    return this.eventManager.allEvents;
  }

  private constructor(name: string, eventManager: EventManager, recorder: Recorder, logger?: IAgentLogger) {
    this.recorderStack = [recorder];
    this.eventManager = eventManager;
    this.name = name;
    this.logger = logger;
  }

  static async create(name: string, bankUrl: string, logger?: IAgentLogger) {
    const eventManager = new EventManager();
    const recorder = await Registry.create({
      name,
      headless: false,
      onEvent: eventManager.onEvent
    }, bankUrl);
    return new PageHandler(name, eventManager, recorder, logger);
  }

  async [Symbol.asyncDispose]() {
    for (const recorder of this.recorderStack) {
      await recorder[Symbol.asyncDispose]();
    }
  }

  pushSection(subName: SectionType) {
    return this.eventManager.pushSection(subName);
  }

  // Isolated sections require their own page
  // This is an exception for account processing
  // where we don't want to modify the current page.
  async pushIsolatedSection(subName: SectionType) {

    using _ = this.eventManager.pause();
    const rs = this.recorderStack;
    rs.push(await this.recorder.clone(subName));
    let events: IEventSectionManager|null = this.eventManager.pushSection(subName);
    return {
      cancel: () => events?.cancel(),
      async [Symbol.asyncDispose]() {
        await events?.[Symbol.asyncDispose]()
        await rs.pop()![Symbol.asyncDispose]();
      }
    }
  }


  async pushValueEvent(element: ElementResponse, name: string, type: ValueType) {
    const found = await this.toElement(element, name);
    const event: ValueEvent = {
      type: "value",
      name,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
      ...found.data
    };

    event.parsing = (type == "table")
      ? {
          type: "table",
          format: null,
        }
      : getValueParsing(found.data.text, type);

    this.eventManager.pushEvent(event);
    return event;
  }

  async title() {
    return await this.page.title();
  }

  async getImage(fullPage: boolean = false) {

    const image = await _getImage(this.page, fullPage);
    this.logger?.logScreenshot(this.currentSectionName, image, this.page);
    return new File([image], "screenshot.png", { type: "image/png" });
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
    throw new Error("Couldn't get page intent");
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
    // try {
      const found = await this.toElement(r, options.name, options.htmlType, options.inputType);
      return await interaction(found);
    // } catch (e) {
      // Save out page/JSON to allow easy debugging
    //   const debugState = {
    //     intent: "debug",
    //     page: `${options.name}-${DateTime.now().toFormat("yyyy-MM-dd-HH-mm-ss")}`,
    //     name: options.name
    //   };
    //   await this.writer.writeScreenshot(this.page, debugState);
    //   this.writer.writeJson(r, debugState);
    //   throw e;
    // }
  }

  async toElement(response: AnyResponse, eventName: string, htmlType?: string, inputType?: string) {
    // First, record the response from the API
    this.logger?.logJson(this.currentSectionName, `vqa-${eventName}`, response);
    // Find the element in the page
    const found = await responseToElement(this.page, response, htmlType, inputType);
    if (!found) {
      throw new Error("Failed to find element for " + eventName);
    }
    // Finally, record what we found
    // Do not include data that is likely to change
    const { frame, ...trimmed } = found.data;
    this.logger?.logJson(this.currentSectionName, `elm-${eventName}`, {
      ...trimmed,
      // ...(extra ? { extra } : {})
    });
    return found;
  }

  // writeScreenshot = () => this.writer.writeScreenshot(this.page, this.state);
  // writeJson = (data: any, eventName: string) => this.writer.writeJson(data, { ...this.state, name: eventName });
}
