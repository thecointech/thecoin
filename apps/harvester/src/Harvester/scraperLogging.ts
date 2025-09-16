
import { getProcessConfig, setProcessConfig } from "./config";
import { AgentSerializer } from "@thecointech/scraper-agent";

// The scraper has a few different input points around.
// We want to the logging switch to be a single source of truth

export async function getScraperLogging() {
  const config = await getProcessConfig();
  // Check config first, then fall back to env variable
  if (config?.alwaysRunScraperLogging !== undefined) {
    return !!config.alwaysRunScraperLogging;
  }
  return process.env['HARVESTER_VERBOSE_AGENT'] === 'true';
}

export async function setScraperLogging(logging: boolean) {
  await setProcessConfig({ alwaysRunScraperLogging: logging });
}


export async function maybeSerializeRun(basePath: string, target: string, writeScreenshotOnElement = false) {
  if (await getScraperLogging()) {
    return new AgentSerializer({
      recordFolder: basePath,
      target,
      writeScreenshotOnElement,
    });
  }
  return null;
}
