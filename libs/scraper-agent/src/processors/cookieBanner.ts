import { GetLandingApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";
import { processorFn, SectionProgressCallback } from "./types";

export const CookieBanner = processorFn("CookieBanner", async (page: PageHandler, progress: SectionProgressCallback) => {
  await closeCookieBanner(page, progress);
})

async function closeCookieBanner(page: PageHandler, progress: SectionProgressCallback) {
  const detected = await cookieBannerDetected(page)
  log.trace(`LandingWriter: Cookie banner detected: ${detected}`);
  if (detected) {
    progress(33);
    const didClose = await page.tryClick(GetLandingApi(), "cookieBannerAccept", {
      noNavigate: true,
      name: "cookie-accept"
  })
    if (didClose) {
      // Reload the page seems to clean up some lost interactions (?)
      // await sleep(500);
      // await this.page.reload({ waitUntil: "networkidle2" });
      // await this.waitForPageLoaded();
      // await this.updatePageName("no-cookie");
    }
    progress(66);
  }

  // Being pedantic, did this work?
  if (await cookieBannerDetected(page)) {
    log.warn("LandingWriter: VQA still sees a cookie banner");
    // Not a big deal, could be a fake-positive
  }
  progress(100);
}

async function cookieBannerDetected(page: PageHandler) {
  const { data: cookiePresent } = await GetLandingApi().cookieBannerPresent(await page.getImage());
  return cookiePresent.cookie_banner_detected;
}
