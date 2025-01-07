import puppeteer, { type Browser } from "puppeteer"
import { jest } from "@jest/globals"
import { describe, IsManualRun } from '@thecointech/jestutils';
import { closeModal, getElementForEvent, maybeCloseModal, registerElementAttrFns } from "./elements";
import { getSiblingScore  } from "./elements.score";
import { patchOnnxForJest } from '../../internal/jestPatch'
import { readFileSync } from "node:fs";

jest.setTimeout(10 * 60 * 1000);

const testFileFolder = process.env.PRIVATE_TESTING_PAGES
const getTestPage = (type: string, name: string) => `file:///${testFileFolder}/${type}/${name}`
const getTestInfo = (type: string, name: string) => JSON.parse(
  readFileSync(`${testFileFolder}/${type}/${name}`, 'utf-8')
)

describe ('Element tests', () => {

  let browser: Browser;
  beforeAll(async () => {
    patchOnnxForJest();
    browser = await puppeteer.launch({ headless: false });
  })

  afterAll(async () => {
    await browser.close();
  })

  const getPage = async () => {
    const page = await browser.newPage()
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await registerElementAttrFns(page);
    page.setBypassCSP(true);
    return page;
  }


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

    await browser.close()
  })

  it ('will close modals automagically', async () => {

    const page = await getPage();
    await page.goto(getTestPage("modal-tests", "test-2.mhtml"));

    const r = await maybeCloseModal(page);
    expect(r).toBeTruthy();
  })

  it ('closes another modal', async () => {
    const page = await getPage();
    await page.goto(getTestPage("modal-tests", "test-1.mhtml"));
    const vqa = getTestInfo("modal-tests", "test-1-vqa.json");

    const r1 = await maybeCloseModal(page);
    const r = await closeModal(page, vqa);
    expect(r).toBeTruthy();
  })
}, IsManualRun && !!testFileFolder)

// To review - This isn't the best evaluation,
// We probably need to improve the semantic
// analysis to get more context for a given element
it('scores siblings', async () => {
  patchOnnxForJest()

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
