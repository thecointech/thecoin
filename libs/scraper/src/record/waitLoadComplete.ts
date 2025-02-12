import { sleep } from "@thecointech/async";
import { log } from "@thecointech/logging";
import { TimeoutError, type Page } from "puppeteer";


export async function waitUntilLoadComplete(page: Page, timeout = 30_000) {
  // Now, wait a bit longer in case there are loads happening:
  const firstLoadTime = Date.now();
  let lastLoadTime = Date.now();
  const updater = (type: string) => () => {
    log.trace(`Got event: ${type}`);
    lastLoadTime = Date.now();
  }
  const updateWait = updater("load");
  const updateDomContentLoaded = updater("domcontentloaded");
  const updateRequest = updater("request");
  page.on("load", updateWait);
  page.on("domcontentloaded", updateDomContentLoaded);
  page.on("request", updateRequest);

  const pagingInterval = 250;
  const minQuietInterval = 5000;

  await new Promise<void>(async (resolve, reject) => {
    while (true) {
      const elapsed = Date.now() - lastLoadTime;
      if (elapsed > minQuietInterval) {
        break;
      }
      const totalElapsed = Date.now() - firstLoadTime;
      if (totalElapsed > timeout) {
        reject(new TimeoutError("Timeout waiting for load"));
      }
      await sleep(pagingInterval);
    }
    resolve();
  });
  page.off("load", updateWait);
  page.off("domcontentloaded", updateDomContentLoaded);
  page.off("request", updateRequest);
}
