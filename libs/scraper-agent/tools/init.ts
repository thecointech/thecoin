import { existsSync, rmSync } from "fs";
import { setupScraper, getUserDataDir } from "@thecointech/scraper/puppeteer";
import { SimilarityPipeline } from "@thecointech/scraper/similarity";
import path from "path";
import { log } from "@thecointech/logging";
import { fileURLToPath } from "url";

export async function init() {
  // fix temp dir to project root
  const filename = fileURLToPath(import.meta.url);
  const tempDir = path.join(path.dirname(filename), "..", ".cache");
  setupScraper({ rootFolder: tempDir, isVisible: async () => true });
  let lastLogMessage = 0;
  let logPeriod = 3000;
  await SimilarityPipeline.init(tempDir, (progress) => {
    switch(progress.status) {
      case "progress":
        if (lastLogMessage + logPeriod > Date.now()) return;
        lastLogMessage = Date.now();
        console.log(`${progress.file}: ${progress.progress}`);
        break;
      case "initiate":
        // console.log(`Beginning download: ${progress.file}`);
        break;
      case "done":
        // console.log(`Download complete: ${progress.file}`);
        break;
      case "download":
        // console.log(`Downloading: ${progress.file}`);
        break;
      case "ready":
        log.info(`Similarity pipeline ready`);
        break;
      default:
        console.log(progress);
        break;
    }
  });
}
