
import { setupScraper } from "@thecointech/scraper";
import { rootFolder } from "./paths";
import { getScraperMode } from "./Harvester/scraperVisible";
import { log } from "@thecointech/logging";

export function initScraper() {
  setupScraper({
    rootFolder,
    isVisible: getScraperMode,
  });
  log.info({ rootFolder }, "Scraper process initialized at root: {rootFolder}");
}