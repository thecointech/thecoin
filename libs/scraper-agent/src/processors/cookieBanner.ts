import { log } from "@thecointech/logging";
import { processorFn } from "./types";
import type { Agent } from "../agent";
import { apis } from "../apis";

export const CookieBanner = processorFn("CookieBanner", async (agent: Agent) => {
  await closeCookieBanner(agent);
})

async function closeCookieBanner(agent: Agent) {
  const detected = await cookieBannerDetected(agent)
  log.trace(`LandingWriter: Cookie banner detected: ${detected}`);
  agent.onProgress(33);

  if (detected) {
    const api = await apis().getLandingApi();
    try {
      const didClose = await agent.page.tryClick(api, "cookieBannerAccept", {
        noNavigate: true,
        hints: { eventName: "cookie-accept" }
      });
      log.trace(`LandingWriter: Cookie banner closed: ${didClose}`);
    }
    catch (err) {
      log.warn(err, `LandingWriter: Failed to close cookie banner`);
    }
    agent.onProgress(66);

    // Being pedantic, did this work?
    if (await cookieBannerDetected(agent)) {
      log.warn("LandingWriter: VQA still sees a cookie banner");
      // Not a big deal, could be a fake-positive
    }
  }
}

async function cookieBannerDetected(agent: Agent) {
  const api = await apis().getLandingApi();
  const { data: cookiePresent } = await api.cookieBannerPresent(await agent.page.getImage());
  return cookiePresent.cookie_banner_detected;
}
