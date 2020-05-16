

/**
  Downloads the CSV file.  Must be written in JS to avoid transpilation issues with Babel
 */
async function downloadTxCsv(page) {

  var csv = await page.evaluate(async () => {
    // taken from the page JS
    //@ts-ignore
    setSubmitVals();
    //@ts-ignore
    const form = document.PFM_FORM;
    const result = await fetch(form.action, {
      method: form.method,
      body: new URLSearchParams([...(new FormData(form))])
    })
    return await result.text();
  });
  return csv
}

module.exports = { downloadTxCsv };