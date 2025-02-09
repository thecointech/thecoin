import { GetLandingApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";

export async function CookieBanner(page: PageHandler): Promise<void> {
  log.trace("CookieBanner: begin processing");
  // const writer = new LandingWriter(config, "Landing");
  // Attempt to close cookie banner that should be present
  await closeCookieBanner(page);
}

async function closeCookieBanner(page: PageHandler) {
  const detected = await cookieBannerDetected(page)
  log.trace(`LandingWriter: Cookie banner detected: ${detected}`);
  if (detected) {
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
  }

  // Being pedantic, did this work?
  if (await cookieBannerDetected(page)) {
    log.warn("LandingWriter: VQA still sees a cookie banner");
    // Not a big deal, could be a fake-positive
  }
}

async function cookieBannerDetected(page: PageHandler) {
  const { data: cookiePresent } = await GetLandingApi().cookieBannerPresent(await page.getImage());
  return cookiePresent.cookie_banner_detected;
}
