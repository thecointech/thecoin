import { setupScraper } from "@thecointech/scraper";
import { rootFolder } from "./paths";
import { getScraperVisible } from "./Harvester/scraperVisible";
import { log } from "@thecointech/logging";

// Initialize main process configurations

export function initMain() {
  setupScraper({
    rootFolder,
    isVisible: getScraperVisible,
  });
  log.info({ rootFolder }, "Main process initialized at root: {rootFolder}");
}
