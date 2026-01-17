import { installBrowser } from "@thecointech/scraper/puppeteer";
import { SimilarityPipeline } from "@thecointech/scraper/similarity";
import { log } from "@thecointech/logging";
import { BackgroundTaskCallback, SubTaskProgress, getErrorMessage } from "@/BackgroundTask";
import { rootFolder } from "@/paths";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { copyProfile } from "./profile";
import crypto from "node:crypto";

export async function downloadRequired(callback: BackgroundTaskCallback, forceCopyProfile=false) {

  log.info("Initialization: fetching required files");
  mkdirSync(rootFolder, { recursive: true })

  const id = crypto.randomUUID();
  const groupTask = {
    type: "initialize" as const,
    id,
  }
  callback(groupTask);
  const onProgress = (info: SubTaskProgress) => {
    callback({
      parentId: id,
      type: "initialize",
      ...info
    })
  }

  const browser = downloadBrowser(onProgress);
  const profile = copyProfile(onProgress, forceCopyProfile);
  const similarity = downloadSimilarity(onProgress);
  await Promise.all([browser, profile, similarity]);

  callback({
    ...groupTask,
    completed: true,
  })
  log.info("Initialization complete");
}

// Make sure we have a compatible browser...
async function downloadBrowser(onProgress: (info: SubTaskProgress) => void) {
  // Download a compatible browser.
  try {
    await installBrowser((bytes, total) => {
      onProgress({
        subTaskId: "chrome",
        percent: (bytes / total) * 100
      })
    })
    onProgress({
      subTaskId: "chrome",
      completed: true,
    })
  }
  catch (e) {
    onProgress({
      subTaskId: "chrome",
      error: getErrorMessage(e),
      completed: true,
    })
  }
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
          completed: true,
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
