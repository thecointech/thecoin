import { existsSync, rmSync } from "fs";
import { setRootFolder } from "@thecointech/scraper/puppeteer-init/browser";
import { SimilarityPipeline } from "@thecointech/scraper/similarity";
import path from "path";

export async function init(cleanRun?: boolean) {
  const tempDir = "./.temp";
  setRootFolder(tempDir);
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
        console.log(`Similarity pipeline ready`);
        break;
      default:
        console.log(progress);
        break;
    }
  });

  if (cleanRun) {
    // Remove existing chrome data so we start fresh (eg, with cookie banners)
    const chromeData = path.join(tempDir, "chrome_data");
    if (existsSync(chromeData)) {
      rmSync(chromeData, { recursive: true, force: true });
    }
  }
}
