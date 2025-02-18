import { jest } from "@jest/globals"
import { describe, IsManualRun } from '@thecointech/jestutils';
import { getElementForEvent } from "./elements";
import { getSiblingScore  } from "./elements.score";
import { getTestPage, getTestInfo, testFileFolder, useTestBrowser } from '../internal/testutils'

jest.setTimeout(10 * 60 * 1000);

describe ('Element tests', () => {

  const { getPage } = useTestBrowser();

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
    const click = getTestInfo("page", "sample1-click.json");

    const page = await getPage();
    await page.goto(sample);

    // first, navigate to the right iframe
    const element = await getElementForEvent(page, click);

    expect(element).toBeTruthy();
  })

}, IsManualRun && !!testFileFolder)

// To review - This isn't the best evaluation,
// We probably need to improve the semantic
// analysis to get more context for a given element
it('scores siblings', async () => {

  // Should be pretty close to 1
  const baseline = await getSiblingScore(
    { siblingText: ["Account Number", "Account Balance"] } as any,
    { siblingText: ["Account #", "Current Balance"] } as any
  )
  expect(baseline).toBeCloseTo(0.7, 0.05)

  // Should be less then baseline
  const modOriginal = await getSiblingScore(
    { siblingText: ["Account Number", "Account Balance", "More Info Here"] } as any,
    { siblingText: ["Account #", "Current Balance"] } as any
  )
  expect(modOriginal).toBeLessThan(baseline)
  // Should be less then 1
  const modCurrent = await getSiblingScore(
    { siblingText: ["Account Number", "Account Balance"] } as any,
    { siblingText: ["Account #", "Current Balance", "More Info Here"] } as any
  )
  expect(modCurrent).toBeLessThan(baseline)
})
