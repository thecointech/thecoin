import { Page } from "puppeteer";

/**
  Downloads the CSV file.  Must be written in JS to avoid transpilation issues with Babel
 */
export async function downloadTxCsv(page: Page) {

  var csv = await page.evaluate(async () => {
    // taken from the page JS
    //@ts-ignore
    setSubmitVals();
    //@ts-ignore
    const form = document.PFM_FORM;
    const result = await fetch(form.action, {
      method: form.method,
      // @ts-ignore
      body: new URLSearchParams([...(new FormData(form))])
    })
    return await result.text();
  });
  return csv
}

module.exports = { downloadTxCsv };
