import { GetLandingApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";
import { processorFn } from "./types";

export const CookieBanner = processorFn("CookieBanner", async (page: PageHandler) => {
  await closeCookieBanner(page);
})

async function closeCookieBanner(page: PageHandler) {
  const detected = await cookieBannerDetected(page)
  log.trace(`LandingWriter: Cookie banner detected: ${detected}`);
  if (detected) {
    page.onProgress(33);
    const api = await GetLandingApi();
    try {
      const didClose = await page.tryClick(api, "cookieBannerAccept", {
        noNavigate: true,
        name: "cookie-accept"
      });
      if (didClose) {
        // Reload the page seems to clean up some lost interactions (?)
        // await sleep(500);
        // await this.page.reload({ waitUntil: "networkidle2" });
        // await this.waitForPageLoaded();
        // await this.updatePageName("no-cookie");
      }
    }
    catch (err) {
      log.warn(`LandingWriter: Failed to close cookie banner: ${err}`);
    }
    page.onProgress(66);
  }

  // Being pedantic, did this work?
  if (await cookieBannerDetected(page)) {
    log.warn("LandingWriter: VQA still sees a cookie banner");
    // Not a big deal, could be a fake-positive
  }
}

async function cookieBannerDetected(page: PageHandler) {
  const api = await GetLandingApi();
  const { data: cookiePresent } = await api.cookieBannerPresent(await page.getImage());
  return cookiePresent.cookie_banner_detected;
}
