import type { ElementSearchParams, FoundElement } from "@thecointech/scraper-types";
import { getTest } from "./data";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { saveSnapshot } from "@thecointech/scraper-archive";


export async function updateTest(key: string, element: string) {

  const test = getTest(key, element);
  const page = await test.page();
  const sch = test.sch(element);
  const elm = test.elm(element);
  const timestamp = Date.now();

  const onFound = async (candidate: FoundElement, _params: ElementSearchParams, candidates: FoundElement[]) => {
    // Write out the snapshot...
    saveSnapshot(test, element, timestamp, elm, candidate, candidates);
  }
  const found = await getElementForEvent({
    ...sch,
    page,
    timeout: 500
  }, onFound);

  return (
    found.data.selector == elm.data.selector &&
    found.data.text == elm.data.text
  )
}
