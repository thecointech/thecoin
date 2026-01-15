import type { AxiosResponse } from "axios";
import { type AnyResponse, responseToElement } from "./vqaResponse";
import { sleep } from "@thecointech/async";
import { log } from "@thecointech/logging";
import { enterValueIntoFound, Registry, type Recorder } from "@thecointech/scraper";
import type { SearchElementData, FoundElement, SearchElement } from "@thecointech/scraper-types";
import { waitPageStable } from "@thecointech/scraper/utilities";
import { _getImageFile } from "./getImage";
import { _getPageIntent } from "./getPageIntent";
import type { SectionType } from "./processors/types";
import { WrappedError } from "./errors";
import { apis } from "./apis";
import { clickElement, waitForValidIntent } from "./interactions";

type ApiFn = (image: File) => Promise<AxiosResponse<AnyResponse>>

type ApiFnName<T> = keyof {
  [K in keyof T as T[K] extends ApiFn ? K : never]: T[K]
}

type InteractionOptions = {
  fullPage?: boolean
  hints: SearchElementData
}

type ClickInteractionOptions = InteractionOptions & {
  noNavigate?: boolean,
  minPixelsChanged?: number
}

type InputInteractionOptions = InteractionOptions & {
  text: string
}

export class PageHandler implements AsyncDisposable {

  recorderStack: Recorder[]

  get recorder() {
    return this.recorderStack.at(-1)!
  }
  get page() {
    return this.recorder.page;
  }

  private constructor(recorder: Recorder) {
    this.recorderStack = [recorder];
  }

  static async create(name: string) {
    const recorder = await Registry.create({
      name,
      // Recording always happens in the "default" context
      // as it's necessary to store 2FA credentials
      context: "default",
    });
    return new PageHandler(recorder);
  }

  async [Symbol.asyncDispose]() {
    for (const recorder of this.recorderStack) {
      await recorder[Symbol.asyncDispose]();
    }
  }

  async tryCloneTab(subName: SectionType) {
    const cachedThis = this;
    const originalIntent = await this.getPageIntent();
    const originalRecorder = this.recorder;
    const originalUrl = originalRecorder.page.url();
    const sectionRecorder = await originalRecorder.clone(subName);

    // Page should be loaded, but that doesn't mean it's ready.
    // Take the extra wait here just to ensure we don't miss anything
    const intent = await waitForValidIntent(sectionRecorder.page);
    await waitPageStable(sectionRecorder.page);

    // We only push the page if it's intent matches
    // the current page.  It's possible that on loading
    // a new page the bank may require a new login
    if (intent && intent == originalIntent) {
      log.debug("Pushing isolated section: " + subName);
      this.recorderStack.push(sectionRecorder);
      return {
        sectionRecorder,
        async [Symbol.asyncDispose]() {
          log.debug("Popping isolated section: " + subName);
          // We need to release the recorder.  This should be the
          // isolated section recorder, but it's possible that
          // the original page has logged out.  In this case we
          // release the original and navigate the new page to the
          // original URL.
          let recorderToRelease = sectionRecorder;
          // First, is the original page still waiting in the
          // same place, or has it already logged out?
          const currentUrl = originalRecorder.page.url();
          if (originalUrl != currentUrl) {
            log.warn("Original page has changed, releasing original recorder");
            recorderToRelease = originalRecorder;
            await sectionRecorder.page.goto(originalUrl);
            const nowIntent = await waitForValidIntent(sectionRecorder.page);
            await waitPageStable(sectionRecorder.page);
            if (nowIntent != originalIntent) {
              log.error(
                { nowIntent, originalIntent, originalUrl },
                `Recieved intent {nowIntent} instead of {originalIntent} when navigating sectionRecorder back to {originalUrl}.
                Continuing, but this will most likely fail.`
              );
            }
          }
          // Release the new recorder/page
          cachedThis.recorderStack.splice(cachedThis.recorderStack.indexOf(recorderToRelease), 1);
          await recorderToRelease[Symbol.asyncDispose]();

          // Even if it hasn't logged out, it may have popped
          // a dialog that we need to handle
          if (originalUrl == currentUrl) {
            await cachedThis.checkSessionLogin();
          }
        }
      }
    }
    else {
      // If the page failed to load, we just dispose of it
      log.warn("Failed to load isolated section, disposing and continuing with main page");
      await sectionRecorder[Symbol.asyncDispose]();
      return null;
    }
  }

  async checkSessionLogin() {
    const api = await apis().getLoginApi();
    const { data: sessionTimeout } = await api.detectSessionTimeoutElement(await this.getImage());
    if (sessionTimeout) {
      try {
        const found = await this.toElement(
          sessionTimeout,
          { eventName: "session-continue", tagName: "button" }
        );
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

  async dynamicInputEntry(input: SearchElement, value: string) {
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
  }

  async title() {
    return await this.page.title();
  }

  async getImage(fullPage: boolean = false) {
    return await _getImageFile(this.page, fullPage);
  }

  async getPageIntent() {
    // TODO: WE really need polly instead of hard-coded attempts for this
    let error: unknown | undefined;
    for (let i = 0; i < 5; i++) {
      try {
        const intent = await _getPageIntent(this.page);
        return intent;
      }
      catch (e) {
        log.warn(`Couldn't get page intent, attempt ${i + 1} of 5`);
        error = e;
      }
      await sleep(1000);
    }
    throw new WrappedError("Couldn't get page intent", error);
  }

  // Functions for interacting with the webpage
  async tryClick<T extends object>(api: T, fnName: ApiFnName<T>, options: ClickInteractionOptions|string) {
    // It may not be a navigation, but if it does trigger a navigation this
    // will help us await it.
    const _options = (typeof options == "string")
      ? { hints: { eventName: options }, minPixelsChanged: undefined }
      : options;
    return await this.doInteraction(api, fnName, (found) => clickElement(this.page, found, _options.noNavigate, _options.minPixelsChanged), _options);
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
    const found = await this.toElement(r, options.hints);
    return await interaction(found);
  }

  async toElement(response: AnyResponse, hints: SearchElementData|string) {
    if (typeof hints == "string") {
      hints = { eventName: hints };
    }
    let found = await responseToElement({
      page: this.page,
      response,
      hints,
    });
    return found;
  }
}
