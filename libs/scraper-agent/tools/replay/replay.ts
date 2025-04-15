import path from "path";
import { getConfig } from "../config";
import { init } from "../init";
import { getReplayEvents } from "../../src/replay/events";
import { readFileSync } from "fs";
import { IScraperCallbacks, replay } from "@thecointech/scraper";
import { maybeCloseModal } from "../../src/modal";

const { baseFolder, config } = getConfig();
await init();

process.env.RUN_SCRAPER_HEADLESS = "false";
const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;
if (!target) {
  throw new Error("Please provide a target");
}

const replayScriptPath = path.join(baseFolder, "record", target, "events.json");
const replayScript = readFileSync(replayScriptPath, "utf-8");
const allEvents = JSON.parse(replayScript);
const replayEvents = getReplayEvents(allEvents, "chqETransfer");

let _hasSetDynamicInput = false;
const callbacks: IScraperCallbacks = {

  onError: async (page, err) => {
    if (await maybeCloseModal(page)) {
      return true;
    }
    // log.error(err);
    return false;
  },
  onProgress: (progress) => {
    // log.info(`Progress: ${progress.stage} - ${progress.stepPercent}%`);
    if (progress.event?.type === "dynamicInput") {
      _hasSetDynamicInput = true;
    }
    // Once input entered, cancel progress so we don't actually send an e-transfer...
    else if (_hasSetDynamicInput && progress.event?.type === "click") {
      return false;
    }
    return true;
  }
}
const r = await replay("TestReplay", replayEvents, callbacks, { amount: "10" });

