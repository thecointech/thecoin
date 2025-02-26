import { jest } from "@jest/globals";
import { IsManualRun, describe } from "@thecointech/jestutils";
import events from './replay.test.json';
import { patchOnnxForJest } from '../internal/jestPatch';
import { AnyEvent } from "./types";
import { replay } from "./replay";

patchOnnxForJest();
jest.setTimeout(5 * 60 * 1000);

// jest.unstable_mockModule('../Harvester/config', () => {
//   return {
//     getEvents: () => events
//   }
// })

// const paths = {
//   logsFolder: path.join('..', 'temp', "logs"),
//   outFolder: path.join('..', 'temp', "out"),
// }
// jest.unstable_mockModule('../paths', () => {
//   return paths
// })

describe("needs more tests!", () => {

  it("Replays events", async () => {

    // Mess up event the first event
    events[1].selector = "youaintgonnafindme";
    events[1].text = "youaintgonnafindme";
    events[1].nodeValue = "youaintgonnafindme";
    events[1].siblingText = [];
    events[1].coords = {
      top: 0,
      left: 0,
      height: 100,
      width: 100,
    }
    process.env.HARVESTER_SAVE_DUMP = "true";
    // const { replay } = await import('./replay');

    // This should throw, because the selector is no longer valid
    await expect(replay("test", events as AnyEvent[])).rejects.toThrow();
    // On throw, we should have written out the page
  })

}, IsManualRun);



