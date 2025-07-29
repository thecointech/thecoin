import { GetIntentApi, GetModalApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import type { ElementResponse } from "@thecointech/vqa";
import { getElementForEvent } from "@thecointech/scraper/elements";
import type { Page } from "puppeteer";
import type { ElementDataMin } from "@thecointech/scraper/types";
import { File } from "@web-std/file";
import { clickElement } from "./vqaResponse";
import { IScraperCallbacks } from "@thecointech/scraper";


export async function maybeCloseModal(page: Page, callbacks?: IScraperCallbacks) {
  log.info('Autodetecting modal on page...');
  try {

    // if (process.env.NOTIFY_ON_MODAL_ENCOUNTER) {
    //   dumpPage(page, "modal" + DateTime.now().toSQLTime()?.replaceAll(":", "-"));
    // }

    // Take screenshot of the page as PNG buffer
    const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
    // Create a simple object that matches what the API expects
    const screenshotFile = new File([screenshot], "screenshot.png", { type: "image/png" });

    callbacks?.onScreenshot?.("ModalDialog", screenshot, page);

    // First check if this is a modal dialog
    const intentApi = await GetIntentApi();
    const { data: intent } = await intentApi.pageIntent(screenshotFile);
    log.debug(`Page detected as type: ${intent.type}`);
    if (intent.type != "ModalDialog") return false;

    log.debug('Modal detected, attempting to close...');

    // If it is a modal, find the close button
    const modalApi = await GetModalApi();
    const { data: closeButton } = await modalApi.modalClose(screenshotFile);
    if (!closeButton) return false;

    callbacks?.logJson?.("ModalDialog", "close-vqa", closeButton);
    log.debug('Close button found, attempting to click...');

    return await closeModal(page, closeButton, callbacks);
  }
  catch (err) {
    log.warn(err, 'Error attempting to close modal');
  }
  finally {
    log.info('Modal detection complete.');
  }
  return false;
}

export async function closeModal(page: Page, closeButton: ElementResponse, cbs?: IScraperCallbacks) {
  // Try to find and click the close button
  const elementData = responseToElementData(closeButton);
  // We have a lower minScore because the only data we have is text + position + neighbours
  // Which has a maximum value of 40 (text) + 20 (position) + 20 (neighbours)
  // So basically, if there is even one things matches, then it's good enough,
  const found = await getElementForEvent(page, elementData, 5000, 20);
  if (!found) return false;
  cbs?.logJson?.("ModalDialog", "close-elm", found);

  const didChange = await clickElement(page, found, true)
  log.info('Clicked close button, modal closed: ' + didChange);

  return didChange;
}

function responseToElementData(closeButton: ElementResponse): ElementDataMin {
  const width = (closeButton.content ?? "").length * 8;
  const height = 16; // Just guess based on avg font size
  return {
    estimated: true,
    text: closeButton.content!,
    nodeValue: closeButton.content!,
    coords: {
      top: closeButton.position_y! - height / 2,
      left: closeButton.position_x! - width / 2,
      height,
      width,
      centerY: closeButton.position_y!,
    },
  };
}
