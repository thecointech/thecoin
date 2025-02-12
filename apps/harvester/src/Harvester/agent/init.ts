import { setRootFolder } from "@thecointech/scraper/puppeteer-init/browser";
import { SimilarityPipeline } from "@thecointech/scraper/similarity";
import { log } from "@thecointech/logging";
import { BackgroundTaskCallback } from "@/BackgroundTask/types";
import { rootFolder } from "@/paths";
import path from "node:path";
import { mkdirSync } from "node:fs";

export async function initAgent(callback: BackgroundTaskCallback) {

  log.info("Agent: Starting initialization");
  mkdirSync(rootFolder, { recursive: true })
  setRootFolder(rootFolder);

  // TODO: This is where we should probably handle downloading puppeteer as well.

  const similarityFolder = path.join(rootFolder, "similarity");
  await SimilarityPipeline.init(similarityFolder, (progress) => {
    switch(progress.status) {
      case "progress":
        callback({
          taskId: "initAgent",
          stepId: progress.file,
          label: `Downloading: ${progress.name}`,
          progress: progress.progress
        })
        break;
      case "initiate":
        callback({
          taskId: "initAgent",
          stepId: progress.file,
          label: `Initiate download: ${progress.name}`,
          progress: 0
        })
        log.debug(`Initiate download: ${progress.file}`);
        break;
      case "done":
        callback({
          taskId: "initAgent",
          stepId: progress.file,
          label: `Download complete: ${progress.name}`,
          progress: 100
        })
        log.debug(`Download complete: ${progress.file}`);
        break;
      case "ready":
        log.info(`Similarity pipeline ready`);
        break;
      default:
        // console.log(progress);
        break;
    }
  });
}
