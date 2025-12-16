import { log } from "@thecointech/logging";
import type { ElementResponse } from "@thecointech/vqa";
import type { Page } from "puppeteer";
import { File } from "@web-std/file";
import { responseToElement } from "./vqaResponse";
import { clickElement } from "./interactions";
import { apis } from "./apis";

export async function maybeCloseModal(page: Page) {
  log.info('Autodetecting modal on page...');
  try {

    // Take screenshot of the page as PNG buffer
    const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
    // Create a simple object that matches what the API expects
    const screenshotFile = new File([screenshot], "screenshot.png", { type: "image/png" });

    // First check if this is a modal dialog
    const intentApi = await apis().getIntentApi();
    const { data: intent } = await intentApi.pageIntent(screenshotFile);
    log.debug(`Page detected as type: ${intent.type}`);
    if (intent.type != "ModalDialog") return false;

    log.debug('Modal detected, attempting to close...');

    // If it is a modal, find the close button
    const modalApi = await apis().getModalApi();
    const { data: closeButton } = await modalApi.modalClose(screenshotFile);
    if (!closeButton) return false;

    log.debug('Close button found, attempting to click...');

    return await closeModal(page, closeButton);
  }
  catch (err) {
    log.warn(err, 'Error attempting to close modal');
  }
  finally {
    log.info('Modal detection complete.');
  }
  return false;
}

export async function closeModal(page: Page, closeButton: ElementResponse) {
  // Try to find and click the close button
  const found = await responseToElement({
    page,
    response: closeButton,
    maxTop: Number.MAX_SAFE_INTEGER,
    hints: {
      eventName: "closeModal",
      tagName: "button",
      // Add an extra hint.  Sometimes the close button
      // will be marked by an (X), and this may help compensate
      label: "close",
    }
  });
  if (!found) return false;

  const didChange = await clickElement(page, found, true)
  log.info('Clicked close button, modal closed: ' + didChange);

  return didChange;
}
