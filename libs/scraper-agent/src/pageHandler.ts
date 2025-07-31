import type { AxiosResponse } from "axios";
import { AnyResponse, clickElement, responseToElement, waitForValidIntent, waitPageStable } from "./vqaResponse";
import { sleep } from "@thecointech/async";
import { log } from "@thecointech/logging";
import { enterValueIntoFound } from "@thecointech/scraper/replay";
import { DynamicInputEvent, ElementDataMin, FoundElement, SearchElement, ValueEvent, ValueType } from "@thecointech/scraper/types";
import { Recorder, Registry } from "@thecointech/scraper/record";
import { getValueParsing } from "@thecointech/scraper/valueParsing";
import { EventManager, IEventSectionManager } from "./eventManager";
import { _getImage } from "./getImage";
import { _getPageIntent } from "./getPageIntent";
import { ElementResponse } from "@thecointech/vqa";
import crypto from "node:crypto";
import { File } from "@web-std/file";
import { sections, SectionType } from "./processors/types";
import { IScraperCallbacks } from "@thecointech/scraper";
import { SectionName } from "./types";
import { GetLoginApi } from "@thecointech/apis/vqa";
import { WrappedError } from "./errors";

type ApiFn = (image: File) => Promise<AxiosResponse<AnyResponse>>

type ApiFnName<T> = keyof {
  [K in keyof T as T[K] extends ApiFn ? K : never]: T[K]
}

type InteractionOptions = {
  name: string
  fullPage?: boolean
  hints?: Partial<ElementDataMin>
}

type ClickInteractionOptions = InteractionOptions & {
  noNavigate?: boolean,
  minPixelsChanged?: number
}

type InputInteractionOptions = InteractionOptions & {
  text: string
}

// Utility type to prevent type inference
// NOTE!  This can be removed in TS5.4 (whenever we upgrade)
type NoInfer<T> = [T][T extends any ? 0 : never];

export class PageHandler {

  name: string;
  recorderStack: Recorder[]
  eventManager: EventManager
  callbacks?: IScraperCallbacks

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

  private constructor(name: string, eventManager: EventManager, recorder: Recorder, callbacks?: IScraperCallbacks) {
    this.recorderStack = [recorder];
    this.eventManager = eventManager;
    this.name = name;
    this.callbacks = callbacks;
  }

  static async create(name: string, bankUrl: string, callbacks?: IScraperCallbacks) {
    const eventManager = new EventManager();
    const recorder = await Registry.create({
      name,
      // Recording always happens in the "default" context
      // as it's necessary to store 2FA credentials
      context: "default",
      onEvent: eventManager.onEvent
    }, bankUrl);
    return new PageHandler(name, eventManager, recorder, callbacks);
  }

  async [Symbol.asyncDispose]() {
    for (const recorder of this.recorderStack) {
      await recorder[Symbol.asyncDispose]();
    }
  }

  pushSection(subName: SectionName) {
    return this.eventManager.pushSection(subName);
  }

  // Isolated sections require their own page
  // This is an exception for account processing
  // where we don't want to modify the current page.
  // NOTE: If the new page fails to load, we reuse
  // the original page and simply navigate back to the original URL
  async pushIsolatedSection(subName: SectionType) {

    using _ = this.eventManager.pause();
    const cachedThis = this;
    const url = this.page.url();
    const sectionPage = await this.recorder.clone(subName);

    // Page should be loaded, but that doesn't mean it's ready.
    // Take the extra wait here just to ensure we don't miss anything
    const intent = await waitForValidIntent(sectionPage.page);
    await waitPageStable(sectionPage.page);

    // We only push the page if it has a valid intent
    // This could fail if the new page fails to load
    // (linux/tangerine remains blank for some reason)
    if (intent) {
      log.debug("Pushing isolated section");
      this.recorderStack.push(sectionPage);
    }
    else {
      // If the page failed to load, we just dispose of it
      log.warn("Failed to load isolated section, disposing and continuing with main page");
      await sectionPage[Symbol.asyncDispose]();
    }

    let events: IEventSectionManager|null = this.eventManager.pushSection(subName);
    return {
      cancel: () => events?.cancel(),
      async [Symbol.asyncDispose]() {
        await events?.[Symbol.asyncDispose]()
        if (intent) {
          log.debug("Popping isolated section");
          await cachedThis.recorderStack.pop()![Symbol.asyncDispose]();
          // If we've left the main page for a little too long, ensure the session isn't timing out
          await cachedThis.checkSessionLogin();
        }
        else {
          log.debug("Not popping isolated section, navigating back to main page");
          // we're still using the main page, navigate back to the original URL
          await cachedThis.page.goto(url);
        }
      }
    }
  }

  async checkSessionLogin() {
    const api = await GetLoginApi();
    const { data: sessionTimeout } = await api.detectSessionTimeoutElement(await this.getImage());
    if (sessionTimeout) {
      using _ = this.eventManager.pause();
      try {
        const found = await this.toElement(sessionTimeout, "session-continue", { tagName: "button" });
        if (found) {
          await clickElement(this.page, found, true);
        }
      }
      catch (e) {
        log.error(e, "Error clicking session timeout");
        // Continue, as we can't be sure this error is fatal
      }
    }
  }


  async pushValueEvent<T>(element: ElementResponse, name: Extract<keyof NoInfer<T>, string>, type: ValueType) {
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

  async pushDynamicInputEvent<T>(input: SearchElement, value: string, name: Extract<keyof NoInfer<T>, string>) {
    await using pauser = this.eventManager.pause();
    await enterValueIntoFound(this.page, input, value);
    // We've typed into the input, but the recorder hasn't yet registerd
    // the event because it doesn't know the user is finished typing.
    // This can be a problem because the pauser is only valid for this function.
    // If the event is not completed now, it will be registered after
    // the pauser is gone and override the dynamic input we create here.
    // To work around this, we press Enter, which triggers the input completion
    // and logs the event, and then blur for good measure.
    await this.page.keyboard.press("Enter");
    await input.element.evaluate(el => el.blur());
    if (pauser.discards.length == 0) {
      // A slightly more risky option
      await this.page.$eval('img', el => el.focus())
      if (pauser.discards.length == 0) {
        log.error("Dynamic input event may be overridden by manual event");
        // For now, we continue, we should never get here
        // but even if we do we don't know for certain that
        // the event will be recorded.  A possible
        // workaround may be to check for duplicates once
        // recording is complete.
      }
    }
    this.logJson("SendETransfer", name + "-elm", input.data);
    const event: DynamicInputEvent = {
      type: "dynamicInput",
      timestamp: Date.now(),
      id: crypto.randomUUID(),
      dynamicName: name,
      ...input.data,
    };
    this.eventManager.pushEvent(event);
  }

  async title() {
    return await this.page.title();
  }

  async getImage(fullPage: boolean = false) {

    const image = await _getImage(this.page, fullPage);
    this.callbacks?.onScreenshot?.(this.currentSectionName, image, this.page);
    return new File([image], "screenshot.png", { type: "image/png" });
  }

  async getPageIntent() {
    // TODO: WE really need polly instead of hard-coded attempts for this
    let error: unknown | undefined;
    for (let i = 0; i < 5; i++) {
      try {
        const intent = await _getPageIntent(this.page);
        if (this.currentSectionName != "Initial") {
          // The 'initial' section is the containing section,
          // we don't care about intent in this area
          this.logJson(this.currentSectionName, "intent-vqa", { type: intent });
        }
        return intent;
      }
      catch (e) {
        log.error(e, `Couldn't get page intent`);
        error = e;
      }
      await sleep(1000);
    }
    throw new WrappedError("Couldn't get page intent", error, this.currentSectionName);
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
    const found = await this.toElement(r, options.name, options.hints);
    return await interaction(found);
  }

  async toElement(response: AnyResponse, eventName: string, hints?: Partial<ElementDataMin>) {
    // First, record the response from the API
    this.logJson(this.currentSectionName, `${eventName}-vqa`, response);
    // Find the element in the page
    let found = await responseToElement(this.page, response, hints);
    if (!found) {
      await this.maybeThrow(new Error("Failed to find element for " + eventName));
      found = await responseToElement(this.page, response, hints);
    }

    // Finally, record what we found
    // Do not include data that is likely to change
    const { frame, ...trimmed } = found.data;
    this.logJson(this.currentSectionName, `${eventName}-elm`, {
      ...trimmed,
      // ...(extra ? { extra } : {})
    });
    return found;
  }

  async maybeThrow(err: Error|unknown) {

    log.error(err, "Encoutered error, attempting to handle...");
    // Can we handle this error?
    // Right now, all we do is close modals,
    // but this could be extended to handle
    // a wide variety of issues.  It would probably
    // pay to have include what the agent was
    // doing and what we expected to happen when the
    // error occurred.

    // Do not record these actions (perhaps should have an error section instead?)
    using _ = this.eventManager.pause();
    const wasHandled = await this.callbacks?.onError?.(this.page, err);

    log.info(` - Error handled: ${wasHandled}`);
    // if not, throw the original error
    if (!wasHandled) throw err;
  }

  // Wrapping logging callbacks into here because I'm lazy

  onProgress(progress: number) {
    const currentName = this.currentSectionName;

    // get index of current section in Section enum
    const step = sections.indexOf(currentName as any);
    this.callbacks?.onProgress?.({
      step,
      stepPercent: progress,
      total: sections.length,
      stage: currentName
    });
  }

  logJson(name: string, eventName: string, data: any) {
    this.callbacks?.logJson?.(name, eventName, data);
  }
}
