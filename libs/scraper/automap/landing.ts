import type { Page } from "puppeteer";
import { getScreenshotFile } from "./screenshot";
import { GetLandingApi, GetIntentApi } from "@thecointech/apis/vqa";
import { sleep } from "@thecointech/async";
import { clickResponseElement } from "./vqaResponse";

  // If we are on a landing page, our job is to get to the login page
export async function processLanding(page: Page) {
  await closeCookieBanner(page);
  await navigateToLogin(page);
}

export async function closeCookieBanner(page: Page) {
  const api = GetLandingApi();
  const currentPage = await getScreenshotFile(page)
  const { data: r } = await api.cookieBannerPresent(currentPage);

  if (r.cookie_banner_detected) {
    const currentPage = await getScreenshotFile(page)
    const { data: acceptResponse } = await api.cookieBannerAccept(currentPage);

    await clickResponseElement(page, acceptResponse);
  }

  // Being pedantic, did this work?
  const stillHasCookieBanner = await api.cookieBannerPresent(currentPage);
  if (stillHasCookieBanner) {
    throw new Error("Failed to close cookie banner");
  }
}


export async function navigateToLogin(page: Page) {
  const api = GetLandingApi();

  const currentPage = await getScreenshotFile(page)
  const { data: r } = await api.navigateToLogin(currentPage);

  // Try clicking
  await clickResponseElement(page, r);

  // Give time to navigate
  await sleep(5000);
  // Once done, give it time to navigate (this could be better)
  const postNavigate = await getScreenshotFile(page)

  const { data: newIntent } = await GetIntentApi().pageIntent(postNavigate);
  if (newIntent.type != "Login") {
    throw new Error("Failed to navigate to login page");
  }
}
