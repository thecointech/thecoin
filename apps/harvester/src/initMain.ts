import { setRootFolder, setIsVisible } from "@thecointech/scraper";
import { rootFolder } from "./paths";
import { initScraping } from "./scraper_bridge";
import { getScraperVisible } from "./Harvester/scraperVisible";

export function initMain() {
  setRootFolder(rootFolder);
  setIsVisible(getScraperVisible);
  initScraping();
}
