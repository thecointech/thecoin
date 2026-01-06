
import { setRootFolder } from "./rootFolder";
import { setIsVisible, type ScraperVisibilityCallback } from "./visibility";
import { Browser } from "@puppeteer/browsers";
import { setBrowserType } from "./type";

export type ScraperInitOptions = {
  rootFolder: string;
  isVisible?: ScraperVisibilityCallback;
  type?: Browser;
}
export function setupScraper({ rootFolder, isVisible, type }: ScraperInitOptions) {
  setRootFolder(rootFolder);
  setIsVisible(isVisible);
  setBrowserType(type);
}
