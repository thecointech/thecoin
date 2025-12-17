import type { Page } from "puppeteer";
import { waitPageStable } from "../src/utilities";

// Used by TestData in jest & tests viewer
export async function gotoPage(page: Page, url: string) {
  page.setBypassCSP(true);
  await page.goto(url);
  await waitPageStable(page, 500, 100, 50);
}
