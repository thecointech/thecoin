import puppeteer from "puppeteer"
import { jest } from "@jest/globals"
import { getElementForEvent, registerElementAttrFns } from "./elements";

jest.setTimeout(10 * 60 * 1000);

it('Generates element data', async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage()
  page.setBypassCSP(true);

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
          // @ts-ignore
          window.getElementData(ev.target)
        )
      }
    }, { capture: true });
  });

  await registerElementAttrFns(page);

  await page.exposeFunction('__onAnyEvent', __onAnyEvent);

  await page.goto("file:///C:/src/page/Overview%20Tangerine.html");

  await promise;
})

it ('finds element data for the selector', async () => {

   const click = {
    "frame": "file:///C:/src/page/Overview%20Tangerine.html#/",
    "tagName": "SPAN",
    "selector": "SPAN#account-summary-card-have-total",
    "coords": {
      "top": 562.9896240234375,
      "right": 365.6666717529297,
      "bottom": 588.9896240234375,
      "left": 300.59375
    },
    "text": "$233.45",
    "font": {
      "font": "700 18px / 21.6px TangerineCircular, Arial, Helvetica, sans-serif",
      "color": "rgb(51, 51, 51)",
      "size": "18px",
      "style": "normal"
    },
    "siblingText": "What I Have"
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage()
  await registerElementAttrFns(page);
  page.setBypassCSP(true);
  await page.goto("file:///C:/src/page/Overview%20Tangerine.html");

  // first, navigate to the right iframe
  const element = await getElementForEvent(page, click);

  expect(element).toBeTruthy();

  await browser.close()
})