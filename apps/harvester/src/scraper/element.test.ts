import puppeteer from "puppeteer"
import { jest } from "@jest/globals"
import { getSelector } from "./elements";

jest.setTimeout(10 * 60 * 1000);


it('Correctly finds elements', async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage()

  let resolve: Function | null = null;
  const promise = new Promise((_resolve) => {
    resolve = _resolve;
  })

  const __onAnyEvent = async (el: any) => {
    console.log(el)

    // const selector = await el?.evaluate(getSelector);
    // const font = await el?.evaluate(getFontData);
    // console.log(selector);
    // console.log(font);
    resolve?.();
  }

  const onNewDocument = async () => {
    window.addEventListener("click", async (ev) => {
      if (ev.target instanceof HTMLElement) {
        alert("hi")
        await __onAnyEvent(ev.target);

      }
    }, { capture: true });
  }

  page.setBypassCSP(true);

  await page.evaluateOnNewDocument(onNewDocument);

  page.goto("https://www.wikipedia.org/");

  await page.waitForSelector("#searchInput")

  // await page.evaluate(runnable(getSelector));

  // console.log("Fn Injected")

  page.evaluate((fn) => {
    eval(`window.getSelector = ${fn};`)
  }, getSelector.toString());

  await page.exposeFunction('__onAnyEvent', __onAnyEvent);

  await page.evaluate(() => {
    window.addEventListener('click', (ev) => {
      const selector = getSelector(ev.target as any);
      __onAnyEvent(selector)
    }, { capture: true })
  });

  await promise;
})