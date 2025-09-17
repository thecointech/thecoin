
import { getProcessConfig, setProcessConfig } from "./config";
import { AgentSerializer, SectionName } from "@thecointech/scraper-agent";

// The scraper has a few different input points around.
// We want the logging switch to be a single source of truth.

export async function getScraperLogging(): Promise<boolean> {
  const config = await getProcessConfig();
  // Check config first, then fall back to env variable
  if (config?.alwaysRunScraperLogging !== undefined) {
    return !!config.alwaysRunScraperLogging;
  }
  return envTrue('HARVESTER_VERBOSE_AGENT');
}

export async function setScraperLogging(logging: boolean) {
  await setProcessConfig({ alwaysRunScraperLogging: logging });
}

/**
 * Returns an AgentSerializer if logging is enabled; otherwise null.
 * Callers must dispose the returned serializer when finished.
 */
export async function maybeSerializeRun(basePath: string, target: string, writeScreenshotOnElement = false, skipSections?: SectionName[]): Promise<AgentSerializer | null> {
  if (await getScraperLogging()) {
    return new AgentSerializer({
      recordFolder: basePath,
      target,
      writeScreenshotOnElement,
      skipSections,
    });
  }
  return null;
}

// Helper for env booleans (case/variant tolerant)
function envTrue(name: string): boolean {
  const v = process.env[name];
  return v?.toLowerCase() === 'true' || v === '1' || v?.toLowerCase() === 'yes';
}
