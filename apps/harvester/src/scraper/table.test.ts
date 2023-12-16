import puppeteer from "puppeteer"
import { jest } from "@jest/globals"
import { registerElementAttrFns } from "./elements";
import { getTableData } from "./table";
import { describe, IsManualRun } from '@thecointech/jestutils';
jest.setTimeout(10 * 60 * 1000);

describe ('Table tests', () => {
  it('Reads table data', async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage()
    page.setBypassCSP(true);
  
    let resolve: Function | null = null;
    const promise = new Promise((_resolve) => {
      resolve = _resolve;
    })
  
    let element: any;
    const __onAnyEvent = async (sel: any) => {
      console.log(sel);
      element = sel
      resolve?.();
    }
  
    await page.evaluateOnNewDocument(async () => {
      window.addEventListener("click", async (ev) => {
        if (ev.target instanceof HTMLElement) {
          await __onAnyEvent(
            // @ts-ignore
            window.getElementData(ev.target)
          )
        }
      }, { capture: true });
    });
  
    await registerElementAttrFns(page);
  
    await page.exposeFunction('__onAnyEvent', __onAnyEvent);
  
    await page.goto("file:///C:/src/td_page/EasyWeb.mhtml");
  
    // Wait for clock
    await promise;
  
    const table = await getTableData(page, element!.font);
    console.log(table)
  })
}, IsManualRun)