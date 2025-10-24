import { getProcessConfig, setProcessConfig } from "./config";

// The scraper has a few different input points around.
// We want to the visibility switch to be a single source of truth

export async function getScraperVisible() {
  const config = await getProcessConfig();
  return !!config?.alwaysRunScraperVisible;
}

export async function setScraperVisible(visible: boolean) {
  await setProcessConfig({ alwaysRunScraperVisible: visible });
}
