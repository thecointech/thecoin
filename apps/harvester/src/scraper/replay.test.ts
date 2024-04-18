import { jest } from "@jest/globals";
import path from "path";
import { startPuppeteer } from "./puppeteer";
import { IsManualRun, describe } from "@thecointech/jestutils";
import events from './replay.test.json';
import { patchOnnxForJest } from '../../internal/jestPatch';

patchOnnxForJest();
jest.setTimeout(5 * 60 * 1000);

jest.unstable_mockModule('../Harvester/config', () => {
  return {
    getEvents: () => events
  }
})

const paths = {
  logsFolder: path.join('..', 'temp', "logs"),
  outFolder: path.join('..', 'temp', "out"),
}
jest.unstable_mockModule('../paths', () => {
  return paths
})

describe("dumpPage", () => {
  it("Dumps page to folder", async () => {
    const { dumpPage } = await import('./replay');
    const { page, browser } = await startPuppeteer(false);

    await page.goto("https://www.wikipedia.org/");

    await dumpPage(page, path.join('..', 'temp', "wikipedia"));

    await browser.close();
  })

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
    const { replay } = await import('./replay');
  
    // This should throw, because the selector is no longer valid
    await expect(replay("chqBalance")).rejects.toThrow();
    // On throw, we should have written out the page
  })
  
}, IsManualRun);



