import { sleep } from "@thecointech/async";
import { type Page } from "puppeteer";
import { log } from "@thecointech/logging";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export async function waitPageStable(page: Page, timeout: number = 20_000, maxPixelsChanged = 100) {
  let before = await page.screenshot();
  const start = Date.now();
  log.trace(`Waiting for page to be stable for ${timeout / 1000} seconds`);
  const maxTime = start + timeout;
  do {
    // Loading animations can result in the appearance
    // of no change if it's looped back on itself.  To reduce this
    // risk, we take a series of screenshots and compare the total over that period
    const pixelsChanged = [];
    let after: Uint8Array;
    for (let i = 0; i < 3; i++) {
      await sleep(250);
      after = await page.screenshot();
      const changed = doPixelMatch(before, after);
      pixelsChanged.push(changed);
      if (changed > maxPixelsChanged) {
        break;
      }
    }
    const changed = pixelsChanged.reduce(
      (score, changed) => score + changed, 0
    );

    if (changed < maxPixelsChanged) {
      log.trace(`Page stable,Only ${changed} < ${maxPixelsChanged} pixels changed after ${elapsedSeconds(start)} seconds`);
      return true;
    }
    before = after!;
  } while (Date.now() < maxTime);

  log.error(`Page has not been stable for ${timeout / 1000} seconds`);
  return false;
}


export function doPixelMatch(before: Uint8Array|ArrayBuffer, after: Uint8Array|ArrayBuffer) {
  const img1 = PNG.sync.read(Buffer.from(before));
  const img2 = PNG.sync.read(Buffer.from(after));
  // With different size images, we cannot compute similarity so just say they are different
  if (img1.width != img2.width || img1.height != img2.height) {
    return img1.width * img1.height;
  }
  return pixelmatch(img1.data, img2.data, null, img1.width, img1.height);
}

const elapsedSeconds = (start: number) => {
  const elapsed = Date.now() - start;
  return (elapsed / 1000).toFixed(2);
}
