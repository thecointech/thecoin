import { GetLandingApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";
import { processorFn } from "./types";

export const Landing = processorFn("Landing", async (page: PageHandler) => {
  await navigateToLogin(page);
})

async function navigateToLogin(page: PageHandler) {
  // Handle pages that have login elements on the front page
  const api = GetLandingApi();
  log.trace(`LandingWriter: Navigating to login`);
  const didNavigate = await page.tryClick(api, "navigateToLogin", {
    name: "login",
    hints: { tagName: "button" }
  });
  if (!didNavigate) {
    await page.maybeThrow(new Error("Failed to navigate to login"));
  }
  page.onProgress(33);

  // Are we on a login page or did we just open a menu?
  let intent = await page.getPageIntent();
  page.onProgress(50);
  if (intent == "MenuSelect") {
    // Now, if we are still on the landing page, it may mean that there
    // is a menu open.  Try and find the login link (again) and click it
    // await this.updatePageName("menu");
    await page.tryClick(api, "navigateToLoginMenu", {
      name: "login",
      hints: { tagName: "a" }
    });
    page.onProgress(66);
    // It's find if this doesn't work, let's continue and hope for the best
    // await this.waitForPageLoaded();

    // Final check
    intent = await page.getPageIntent();
  }

  // We should now be on the login page
  if (intent != "Login") {
    await page.maybeThrow(new Error("Failed to navigate to login page"));
  }
  // return intent;
}



