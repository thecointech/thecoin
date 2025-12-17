
import type { Page } from "puppeteer";
import { sleep } from "@thecointech/async";
import { log } from "@thecointech/logging";
import { File } from "@web-std/file";

export class TakeScreenshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TakeScreenshotError";
  }
}
export async function _getImage(page: Page, fullPage: boolean = false, path?: string, retries = 3) {

  const existingViewport = page.viewport();
  for (let i = 0; i < retries; i++) {
    try {
      if (fullPage) {
        await resizeViewportForPage(page);
      }
      const screenshot = await page.screenshot({ type: 'png', fullPage, path });
      if (fullPage) {
        await page.setViewport(existingViewport);
      }
      return screenshot;
    }
    catch (err) {
      log.debug(err, "Encountered error when taking screenshot");
      await sleep(1000);
    }
  }
  throw new Error("Could not take screenshot");
}

export async function _getImageFile(page: Page, fullPage: boolean = false, retries = 3) {
  const image = await _getImage(page, fullPage, undefined, retries);
  return new File([image], "screenshot.png", { type: "image/png" });
}

async function resizeViewportForPage(page: Page) {
  // Get the maximum scroll height by checking all scrollable elements
  const maxScrollHeight = await page.evaluate(() => {
    const getScrollHeight = (element: Element) => {
      const { scrollHeight, clientHeight } = element;
      return Math.max(scrollHeight, clientHeight);
    };

    // Get all elements that might be scrollable
    const scrollableElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.overflow === 'auto' || style.overflow === 'scroll' ||
              style.overflowY === 'auto' || style.overflowY === 'scroll';
    });

    // Get maximum height including the document itself
    const heights = [
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      ...scrollableElements.map(getScrollHeight)
    ];

    return Math.max(...heights);
  });

  // Set viewport height to match the maximum content height
  await page.setViewport({
    width: await page.evaluate(() => document.documentElement.clientWidth),
    height: maxScrollHeight,
    deviceScaleFactor: 1,
  });
}
