import type { AccountResponse, ElementResponse, InputElementResponse, MoneyElementResponse } from "@thecointech/vqa";
import type { ElementSearchParams, FoundElement, SearchElementData } from "@thecointech/scraper/types";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { isPresent } from "@thecointech/utilities/ArrayExtns";
import { _getPageIntent } from "./getPageIntent";

export type AnyResponse = ElementResponse | InputElementResponse | MoneyElementResponse;
type ResponseSearchParams = {
  response: AnyResponse,
  hints?: SearchElementData,
} & Omit<ElementSearchParams, "event">;

export function responseToElementData({ response, hints }: ResponseSearchParams): SearchElementData {
  const text = getContent(response);
  const width = text.length * 8;
  const height = 20; // Just guess based on avg font size
  return {
    // The default value, overwritten by hints
    eventName: "--unset--",
    ...hints,
    // Force consistent casing for comparisons
    tagName: hints?.tagName?.toUpperCase(),
    inputType: hints?.inputType?.toLowerCase(),
    role: hints?.role?.toLowerCase(),
    // Now apply response data
    estimated: true,
    text,
    // We use a specific text-text scorer, so do not duplicate with nodeValue as that
    // may skew results and overpower the tagName/inputType scores
    // nodeValue: text,
    label: text,
    siblingText: [getNeighbourText(response)].filter(isPresent),
    coords: {
      top: response.position_y! - height / 2,
      left: response.position_x! - width / 2,
      height,
      width,
      centerY: response.position_y!,
    },
  };
}


export const accountToElementResponse = (account: AccountResponse) => ({
  position_x: account.position_x,
  position_y: account.position_y,
  background_color: "#f0f0f0",
  font_color: "#000000",
  neighbour_text: `${account.balance}`, // At a guess it should be close to the balance
  content: `${account.account_type} ${account.account_name} ${account.account_number}`,
});


export async function responseToElement(search: ResponseSearchParams): Promise<FoundElement> {
  // Try to find and click the close button
  const elementData = responseToElementData(search);

  // Only look for elements that are visible (above the fold)
  const maxTop = search.maxTop ?? search.page.viewport()!.height + 100;
  // We have a lower minScore because the only data we have is text + position + neighbours
  // Which has a maximum value of 40 (text) + 20 (position) + 20 (neighbours)
  // So basically, if there is even one things matches, then it's good enough,
  return await getElementForEvent({
    ...search,
    maxTop,
    event: elementData,
    minScore: search.minScore ?? 20,
  });
}


function getContent(r: AnyResponse) {
  if ("content" in r) {
    return r.content;
  }
  else if ("placeholder_text" in r) {
    return r.placeholder_text ?? "";
  }
  return "";
}

function getNeighbourText(r: AnyResponse): string|undefined {
  if ("neighbour_text" in r) {
    return r.neighbour_text;
  }
  return undefined;
}

