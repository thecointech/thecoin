import type { Page } from "puppeteer";
import { GetLandingApi, GetIntentApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";


export class LandingWriter extends IntentWriter {

  static async process(page: Page, baseFolder: string, name: string) {
    const writer = new LandingWriter(page, baseFolder, name, "Landing");
    await writer.setNewState("initial");
    // Attempt to close cookie banner that should be present
    await writer.closeCookieBanner();
    // Navigate to the login page
    await writer.navigateToLogin();
  }

  async closeCookieBanner() {
    const api = GetLandingApi();
    const { data: cookiePresent } = await api.cookieBannerPresent(this.getImage());

    if (cookiePresent.cookie_banner_detected) {
      await this.updateScreenshotImage();
      const r = await api.cookieBannerAccept(this.getImage());
      const r2 = await api.cookieBannerAccept(this.getImage());
      const r3 = await api.cookieBannerAccept(this.getImage());
      if (await this.tryClick(api, "cookieBannerAccept", "cookie-banner-accept")) {
        await this.setNewState("no-cookie");
      }
    }

    // Being pedantic, did this work?
    const stillHasCookieBanner = await api.cookieBannerPresent(this.getImage());
    if (stillHasCookieBanner) {
      console.error("VQA still sees a cookie banner");
      // throw new Error("Failed to close cookie banner");
    }
  }

  async navigateToLogin() {
    const api = GetLandingApi();

    const didNavigate = await this.tryClick(api, "navigateToLogin", "login");
    if (!didNavigate) {
      console.error("Failed to navigate to login");
      throw new Error("Failed to navigate to login");
    }

    // Now, if we are still on the landing page, it may mean that there
    // is a menu open.  Try and find the login link (again) and click it
    await this.setNewState("menu");
    if (this.currentPageIntent == "Landing") {
      const didMenu = await this.tryClick(api, "navigateToLogin", "login");
      if (!didMenu) {
        console.error("Failed to navigate via menu to login");
        throw new Error("Failed to navigate via menu to login");
      }

      await this.updatePageIntent();
    }

    // We should now be on the login page
    if (this.currentPageIntent != "Login") {
      throw new Error("Failed to navigate to login page");
    }
    return this.currentPageIntent;
  }
}



