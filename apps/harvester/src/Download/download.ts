import { installBrowser } from "@thecointech/scraper/puppeteer";
import { SimilarityPipeline } from "@thecointech/scraper/similarity";
import { log } from "@thecointech/logging";
import { BackgroundTaskCallback, SubTaskProgress } from "@/BackgroundTask/types";
import { rootFolder } from "@/paths";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { copyProfile } from "./profile";

export async function downloadRequired(callback: BackgroundTaskCallback) {

  log.info("Initialization: fetching required files");
  mkdirSync(rootFolder, { recursive: true })

  const timestamp = Date.now().toString();
  callback({
    type: "initialize",
    id: timestamp,
  })
  let allComplete = true;
  const onProgress = (info: SubTaskProgress) => {
    if (info.error) {
      allComplete = false;
    }
    callback({
      parentId: timestamp,
      type: "initialize",
      ...info
    })
  }

  const browser = downloadBrowser(onProgress);
  const profile = copyProfile(onProgress);
  const similarity = downloadSimilarity(onProgress);
  await Promise.all([browser, profile, similarity]);

  callback({
    type: "initialize",
    id: timestamp,
    completed: allComplete
  })
  log.info("Initialization complete");
}

// Make sure we have a compatible browser...
async function downloadBrowser(onProgress: (info: SubTaskProgress) => void) {
  // Download a compatible browser.
  return installBrowser((bytes, total) => {
    onProgress({
      subTaskId: "chrome",
      percent: (bytes / total) * 100
    })
  }).then(() => {
    onProgress({
      subTaskId: "chrome",
      completed: true
    })
  }).catch((e) => {
    onProgress({
      subTaskId: "chrome",
      error: e,
      completed: false
    })
  })
}


function downloadSimilarity(onProgress: (info: SubTaskProgress) => void) {
  const similarityFolder = path.join(rootFolder, "similarity");
  return SimilarityPipeline.init(similarityFolder, (progress) => {
    switch(progress.status) {
      case "progress":
        onProgress({
          subTaskId: progress.file,
          percent: progress.progress
        })
        break;
      case "initiate":
        onProgress({
          subTaskId: progress.file,
          percent: 0
        })
        log.debug(`Initiate download: ${progress.file}`);
        break;
      case "done":
        onProgress({
          subTaskId: progress.file,
          percent: 100,
          completed: true
        })
        log.debug(`Download complete: ${progress.file}`);
        break;
      case "ready":
        // onProgress({
        //   // Signal that the whole pipeline is ready
        //   completed: true
        // })
        log.info(`Similarity pipeline ready`);
        break;
      default:
        // console.log(progress);
        break;
    }
  });
}
