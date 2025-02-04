import { GetIntentApi, GetModalApi } from "@thecointech/apis/vqa";
import { sleep } from "@thecointech/async";
import { log } from "@thecointech/logging";
import type { ElementResponse } from "@thecointech/vqa";
import { getElementForEvent } from "./elements";
import type { Page } from "puppeteer";
import type { ElementDataMin } from "./types";



export async function maybeCloseModal(page: Page) {
  log.info('Autodetecting modal on page...');
  try {

    // if (process.env.NOTIFY_ON_MODAL_ENCOUNTER) {
    //   dumpPage(page, "modal" + DateTime.now().toSQLTime()?.replaceAll(":", "-"));
    // }

    // Take screenshot of the page as PNG buffer
    const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
    // Create a simple object that matches what the API expects
    const screenshotFile = new File([screenshot], "screenshot.png", { type: "image/png" });


    // First check if this is a modal dialog
    const title = await page.title();
    const { data: intent } = await GetIntentApi().pageIntent(title, screenshotFile);
    log.debug(`Page detected as type: ${intent.type}`);
    if (intent.type != "ModalDialog") return false;

    log.debug('Modal detected, attempting to close...');

    // If it is a modal, find the close button
    const { data: closeButton } = await GetModalApi().modalClose(screenshotFile);
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
  const elementData = responseToElementData(closeButton);
  // We have a lower minScore because the only data we have is text + position + neighbours
  // Which has a maximum value of 40 (text) + 20 (position) + 20 (neighbours)
  // So basically, if there is even one things matches, then it's good enough,
  const found = await getElementForEvent(page, elementData, 5000, 20);
  if (!found) return false;

  try {
    await found.element.click();
  }
  catch (err) {
    // We seem to be getting issues with clicking buttons:
    // https://github.com/puppeteer/puppeteer/issues/3496 suggests
    // using eval instead.
    log.debug(`Click failed, retrying on ${found.data.selector} - ${err}`);
    await page.$eval(found.data.selector, (el) => (el as HTMLElement).click())
  }
  await sleep(500); // Give the modal time to close
  log.info('Clicked close button, modal closed.');

  // Validation - does this work on live runs?
  // if (process.env.NOTIFY_ON_MODAL_ENCOUNTER) {
  //   notify({
  //     title: 'Modal Successfully Closed',
  //     message: "Closed Modal on page: " + page.url(),
  //   })
  // }
  return true;
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
