import { setupScraper, installBrowser } from "@thecointech/scraper";
import { log } from "@thecointech/logging";

export async function init() {
  // Setup scraper
  const rootFolder = process.env.THECOIN_DATA ?? "./.cache/";
  setupScraper({rootFolder});

  // If we don't have a browser, download one now...
  let lastPercent = -1;
  await installBrowser((progress, total) => {
    const percent = progress / total;
    if (percent - lastPercent > 0.1) {
      log.info({percent: percent * 100}, "Downloaded {percent}%");
      lastPercent = percent;
    }
  });
}
