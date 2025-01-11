import type { ElementResponse } from "@thecointech/vqa";
import type { ElementDataMin } from "../../src/types";
import type { Page } from "puppeteer";
import { FoundElement, getElementForEvent } from "../../src/elements";

export function responseToElementData(response: ElementResponse, htmlType?: string, inputType?: string): ElementDataMin {
  const width = (response.content ?? "").length * 8;
  const height = 20; // Just guess based on avg font size
  return {
    estimated: true,
    tagName: htmlType?.toUpperCase(),
    inputType: inputType?.toLowerCase(),
    text: response.content!,
    // nodeValue: response.content!,
    label: response.content!,
    // Include original text in neighbour text, LLM isn't known for being precise
    siblingText: [response.neighbour_text, response.content].filter(t => !!t),
    coords: {
      top: response.position_y! - height / 2,
      left: response.position_x! - width / 2,
      height,
      width,
      centerY: response.position_y!,
    },
  };
}


export async function responseToElement(page: Page, e: ElementResponse, htmlType?: string, inputType?: string, timeout?: number): Promise<FoundElement> {
  // Try to find and click the close button
  const elementData = responseToElementData(e, htmlType, inputType);

  // We have a lower minScore because the only data we have is text + position + neighbours
  // Which has a maximum value of 40 (text) + 20 (position) + 20 (neighbours)
  // So basically, if there is even one things matches, then it's good enough,
  return await getElementForEvent(page, elementData, timeout ?? 5000, 20);
}


export async function clickElement(page: Page, element: FoundElement) {
  try {
    await element.element.click();
  }
  catch (err) {
    // We seem to be getting issues with clicking buttons:
    // https://github.com/puppeteer/puppeteer/issues/3496 suggests
    // using eval instead.
    // log.debug(`Click failed, retrying on ${found.data.selector} - ${err}`);
    await page.$eval(element.data.selector, (el) => (el as HTMLElement).click())
  }
}
