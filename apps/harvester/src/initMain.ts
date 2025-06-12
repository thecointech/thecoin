import { setRootFolder, setIsVisible } from "@thecointech/scraper";
import { rootFolder } from "./paths";
import { getScraperVisible } from "./Harvester/scraperVisible";

// Initialize main process configurations

export function initMain() {
  setRootFolder(rootFolder);
  setIsVisible(getScraperVisible);
}
