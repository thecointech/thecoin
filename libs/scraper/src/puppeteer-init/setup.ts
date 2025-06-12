
import { setRootFolder } from "./rootFolder";
import { setIsVisible, type ScraperVisibilityCallback } from "./visibility";

export type ScraperInitOptions = {
  rootFolder: string;
  isVisible: ScraperVisibilityCallback;
}
export function setupScraper({ rootFolder, isVisible }: ScraperInitOptions) {
  setRootFolder(rootFolder);
  setIsVisible(isVisible);
}
