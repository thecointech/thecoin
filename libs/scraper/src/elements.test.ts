import { jest } from "@jest/globals"
import { describe, IsManualRun } from '@thecointech/jestutils';
import { getElementForEvent } from "./elements";
import { getTestPage, getTestInfo, testFileFolder, useTestBrowser } from '../internal/testutils'

jest.setTimeout(10 * 60 * 1000);

const { getPage } = useTestBrowser();

describe ('Element tests', () => {


  it('Generates element data', async () => {

    const page = await getPage();

    let resolve: Function | null = null;
    const promise = new Promise((_resolve) => {
      resolve = _resolve;
    })

    const __onAnyEvent = async (sel: any) => {
      console.log(sel);
      resolve?.();
    }

    await page.evaluateOnNewDocument(async () => {
      window.addEventListener("click", async (ev) => {
        if (ev.target instanceof HTMLElement) {
          alert("hi")
          await __onAnyEvent(
            window.getElementData(ev.target)
          )
        }
      }, { capture: true });
    });

    await page.exposeFunction('__onAnyEvent', __onAnyEvent);

    await page.goto(getTestPage("page", "sample1.html"));

    await promise;
  })

  it ('finds element data for the selector', async () => {

    // NOTE: this page is not currently present, get a copy if we need these tests again
    const sample = getTestPage("page", "sample1.html");
    const event = getTestInfo("page", "sample1-event.json");

    const page = await getPage();
    await page.goto(sample);

    // first, navigate to the right iframe
    const element = await getElementForEvent({ page, event });

    expect(element).toBeTruthy();
  })

}, IsManualRun && !!testFileFolder)
