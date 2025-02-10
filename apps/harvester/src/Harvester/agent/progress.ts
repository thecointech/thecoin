import { log } from "@thecointech/logging";
import { ProgressInfo } from "@thecointech/scraper-agent";

export function onProgress(info: ProgressInfo) {
  log.info(JSON.stringify(info));
}
