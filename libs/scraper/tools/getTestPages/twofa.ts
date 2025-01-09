import type { Page } from "puppeteer";
import { GetTwofaApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import type { ElementResponse } from "@thecointech/vqa";
import { clickElement } from "./vqaResponse";
import { ElementOptions, IAskUser } from "./askUser";

export class TwoFAWriter extends IntentWriter {

  static async process(page: Page, name: string, askUser: IAskUser) {
    log.trace("TwoFAWriter: begin processing");
    const writer = new TwoFAWriter(page, name, "2FA", askUser);
    await writer.setNewState("initial");
    // There should always be a username here
    await writer.complete2FA();
    return await writer.updatePageIntent();
  }

  askUser: IAskUser;
  constructor(page: Page, name: string, intent: string, askUser: IAskUser) {
    super(page, name, intent);
    this.askUser = askUser;
  }

  async complete2FA() {
    const api = GetTwofaApi();
    const { data: action } = await api.detectActionRequired(await this.getImage());
    switch (action.action) {
      case "SelectDestination":
        return await this.selectDestination();
      case "InputCode":
        return await this.enterCode();
      case "ApproveInApp":
        return await this.approveInApp();
      case "Error":
        throw new Error("2FA Error happened and we can't recover");
      default:
        throw new Error("Failed to detect action");
    }
  }

  async selectDestination() {
    const api = GetTwofaApi();
    const { data: destinations } = await api.detectDestinations(await this.getImage());
    const allOptions: ElementOptions = {}
    if (destinations) {
      for (const d of destinations.phone_nos) {
        const { data: options } = await api.getDestinationElements(d, await this.getImage());
        allOptions[d] = options.elements;
      }
    }
    const dest = await this.askUserForDestination(allOptions);
    const clickedOption = await this.completeInteraction(dest, "destination", (found) => clickElement(this.page, found), "", 3000);
    if (!clickedOption) {
      throw new Error("Failed to click destination");
    }
    this.setNewState("code");
    await this.enterCode();
  }

  async enterCode() {
    const api = GetTwofaApi();
    const code = await this.askUserForCode();
    const didEnter = await this.tryEnterText(api, "getAuthInput", code, "code");
    if (!didEnter) {
      throw new Error("Failed to enter code");
    }
    await this.clickRemember();
    await this.clickSubmit();
  }

  async approveInApp() {
    log.info("Waiting for 2FA approval");
    // TODO: Query the page for the actual 2FA message
    try {
      const waitTimeout = 300_000;
      const maxTime = Date.now() + waitTimeout;
      // Open a promise on waiting for navigation to complete, give it 5 minutes
      const navigationPromise = this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: waitTimeout });
      // Also open a promise checking the page intent.  If it changes from 2FA then we are done
      const pageIntentPromise = new Promise<void>(resolve => {
        let updateInterval = setInterval(async () => {
          try {
            if (Date.now() > maxTime || await this.updatePageIntent() != "TwoFactorAuth") {
              clearInterval(updateInterval);
              resolve();
            }
          }
          catch(e) {
            clearInterval(updateInterval);
            throw e;
          }
        }, 5000);
      });
      await Promise.race([navigationPromise, pageIntentPromise]);
    }
    catch (e) {
      log.error(e, "Failed to wait for 2FA approval");
      throw e;
    }
    log.info("2FA approved");
    return this.askUser.forValue("Press enter once the code has been approved: ");
  }

  async clickRemember() {
    const api = GetTwofaApi();
    const clickedSkip = await this.tryClick(api, "getSkipInput", "remember");
    if (!clickedSkip) {
      // It's possible that there is no remember checkbox
      log.warn("Failed to click remember");
    }
  }

  async clickSubmit() {
    const api = GetTwofaApi();
    const clickedSubmit = await this.tryClick(api, "getSubmitInput", "login");
    if (!clickedSubmit) {
      throw new Error("Failed to click submit");
    }
  }

  async askUserForCode() {
    // TODO: Query the page for the actual 2FA message
    return this.askUser.forValue("Enter the 2FA code: ");
  }

  async askUserForDestination(destinations: ElementOptions) {
    // TODO: Query the page for the actual 2FA message
    return this.askUser.selectOption("Select where to send the code: ", destinations);
  }
}



