import puppeteer from "puppeteer"
import { jest } from "@jest/globals"
import { registerElementAttrFns } from "./elements";

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

  page.goto("file:///C:/src/page/Overview%20Tangerine.html");

  await promise;
})

// it ('finds element data for the selector', async () => {
//   const selector = {"selector":"H1","font":{"font":"700 32px / 38.4px TangerineCircular, Arial, Helvetica, sans-serif","color":"rgb(51, 51, 51)","size":"32px","style":"normal"}};

//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage()
//   page.setBypassCSP(true);

// })