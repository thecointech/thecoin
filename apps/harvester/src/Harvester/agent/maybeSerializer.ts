import { AgentSerializer } from "@thecointech/scraper-agent";

export function maybeSerializeRun(basePath: string, target: string, writeScreenshotOnElement = false) {
  if (process.env['HARVESTER_VERBOSE_AGENT']) {
    return new AgentSerializer({
      recordFolder: basePath,
      target,
      writeScreenshotOnElement,
    });
  }
  return null;
}
