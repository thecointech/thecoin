import { GetLandingApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { ProcessConfig } from "./types";


export class LandingWriter extends IntentWriter {

  static async process(config: ProcessConfig, clean: boolean) {
    log.trace("LandingWriter: begin processing");
    const writer = new LandingWriter(config, "Landing");
    // Attempt to close cookie banner that should be present
    if (clean) {
      using _ = config.eventManager.pause();
      await writer.closeCookieBanner();
    }
    // Navigate to the login page
    return writer.navigateToLogin();
  }

  async closeCookieBanner() {
    const detected = await this.cookieBannerDetected()
    log.trace(`LandingWriter: Cookie banner detected: ${detected}`);
    if (detected) {
      const didClose = await this.tryClick(GetLandingApi(), "cookieBannerAccept", {
        noNavigate: true,
        name: "cookie-accept"
    })
      if (didClose) {
        // Reload the page seems to clean up some lost interactions (?)
        // await sleep(500);
        // await this.page.reload({ waitUntil: "networkidle2" });
        // await this.waitForPageLoaded();
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
    const didNavigate = await this.tryClick(api, "navigateToLogin", {
      name: "login",
      htmlType: "button"
    });
    if (!didNavigate) {
      throw new Error("Failed to navigate to login");
    }
    log.trace(`LandingWriter: Waiting for page to load`);
    // await this.waitForPageLoaded();

    // Are we on a login page or did we just open a menu?
    let intent = await this.getPageIntent();
    if (intent == "MenuSelect") {
      // Now, if we are still on the landing page, it may mean that there
      // is a menu open.  Try and find the login link (again) and click it
      await this.updatePageName("menu");
      await this.tryClick(api, "navigateToLoginMenu", {
        name: "login",
        htmlType: "a"
      });
      // It's find if this doesn't work, let's continue and hope for the best
      // await this.waitForPageLoaded();

      // Final check
      intent = await this.getPageIntent();
    }

    // We should now be on the login page
    if (intent != "Login") {
      throw new Error("Failed to navigate to login page");
    }
    return intent;
  }
}



