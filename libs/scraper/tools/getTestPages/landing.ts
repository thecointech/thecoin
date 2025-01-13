import type { Page } from "puppeteer";
import { GetLandingApi, GetIntentApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { ProcessConfig } from "./types";


export class LandingWriter extends IntentWriter {

  static async process(config: ProcessConfig) {
    log.trace("LandingWriter: begin processing");
    const writer = new LandingWriter(config, "Landing");
    // Attempt to close cookie banner that should be present
    await writer.closeCookieBanner();
    // Navigate to the login page
    await writer.navigateToLogin();
    return writer.getPageIntent();
  }

  async closeCookieBanner() {
    const detected = await this.cookieBannerDetected()
    log.trace(`LandingWriter: Cookie banner detected: ${detected}`);
    if (detected) {
      const didClose = await this.tryClick(GetLandingApi(), "cookieBannerAccept", "cookie-accept")
      if (didClose) {
        await this.updatePageName("no-cookie");
      }
    }

    // Being pedantic, did this work?
    if (await this.cookieBannerDetected()) {
      log.warn("LandingWriter: VQA still sees a cookie banner");
      // throw new Error("Failed to close cookie banner");
    }
  }

  async cookieBannerDetected() {
    const { data: cookiePresent } = await GetLandingApi().cookieBannerPresent(await this.getImage());
    return cookiePresent.cookie_banner_detected;
  }

  async navigateToLogin() {
    // Handle pages that have login elements on the front page
    if (await this.getPageIntent() == "Login") {
      return "Login";
    }
    const api = GetLandingApi();
    log.trace(`LandingWriter: Navigating to login`);
    const didNavigate = await this.tryClick(api, "navigateToLogin", "login", "button", "", 5000);
    if (!didNavigate) {
      console.error("Failed to navigate to login");
      throw new Error("Failed to navigate to login");
    }
    log.trace(`LandingWriter: Waiting for page to load`);
    await this.waitForPageLoaded();

    let intent = await this.getPageIntent();

    if (intent == "Landing" || true) {
      // Now, if we are still on the landing page, it may mean that there
      // is a menu open.  Try and find the login link (again) and click it
      await this.updatePageName("menu");
      const didMenu = await this.tryClick(api, "navigateToLogin", "login", "a", "", 5000);
      if (!didMenu) {
        console.error("Failed to navigate via menu to login");
        throw new Error("Failed to navigate via menu to login");
      }
      // await this.waitForPageLoaded();
      intent = await this.getPageIntent();
    }

    // We should now be on the login page
    if (intent != "Login") {
      throw new Error("Failed to navigate to login page");
    }
    return intent;
  }
}



