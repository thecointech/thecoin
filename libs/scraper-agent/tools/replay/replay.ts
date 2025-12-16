import path from "path";
import { getConfig } from "../config";
import { init } from "../init";
import { getReplayEvents } from "../../src/replay/events";
import { readFileSync } from "fs";
import { IReplayCallbacks, replay, setupScraper } from "@thecointech/scraper";

// Replay previous run events

const { baseFolder, config } = getConfig();
await init();

const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;
if (!target) {
  throw new Error("Please provide a target");
}

const replayScriptPath = path.join(baseFolder, "record", target, "events.json");
const replayScript = readFileSync(replayScriptPath, "utf-8");
const allEvents = JSON.parse(replayScript);
const replayEvents = getReplayEvents(allEvents, "chqETransfer");

let _hasSetDynamicInput = false;
const callbacks: IReplayCallbacks = {

  onError: async (_params) => {
    // if (await maybeCloseModal(page)) {
    //   return true;
    // }
    // log.error(err);
    return undefined;
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
setupScraper({
  rootFolder: baseFolder,
  isVisible: async () => true
});
const r = await replay({ name: "TestReplay", events: replayEvents, callbacks, dynamicValues: { amount: "10" } });

