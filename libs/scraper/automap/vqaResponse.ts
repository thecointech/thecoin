import type { ElementResponse } from "@thecointech/vqa";
import type { ElementDataMin } from ".@thecointech/scraper/types";
import type { Page } from "puppeteer";
import { getElementForEvent } from "../scraper/elements";
import { sleep } from "@thecointech/async";

export function responseToElementData(closeButton: ElementResponse): ElementDataMin {
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


export async function clickResponseElement(page: Page, e: ElementResponse) {
  // Try to find and click the close button
  const elementData = responseToElementData(e);

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
    // log.debug(`Click failed, retrying on ${found.data.selector} - ${err}`);
    await page.$eval(found.data.selector, (el) => (el as HTMLElement).click())
  }

  await sleep(500); // Give the modal time to close
}
