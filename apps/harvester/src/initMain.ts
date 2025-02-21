import { setRootFolder } from "@thecointech/scraper";
import { rootFolder } from "./paths";
import { initScraping } from "./scraper_bridge";

export function initMain() {
  setRootFolder(rootFolder);
  initScraping();
}
