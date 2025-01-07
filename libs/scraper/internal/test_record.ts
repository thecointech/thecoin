import { sleep } from '@thecointech/async';
import { startPuppeteer } from '../src/puppeteer-init/init';
import { Recorder } from '../src/record';
import { replayEvents } from '../src/replay';
import { AnyEvent } from '../src/types';

console.log("Testing stuff");

process.env.RUN_SCRAPER_HEADLESS = "false";

let doReplay = true;

//    const config = await getProcessConfig();
//    let events: AnyEvent[] = config?.scraping?.chqBalance ?? [];

const events: AnyEvent[] = [];

const recorder =  await Recorder.instance({
  name: "chqBalance",
  url: "https://www.google.com",
  dynamicInputs: ["SearchFor"],
  onComplete: async (events) => {
    console.log("Completed");
    events.push(...events);
  }
});
// const recorder =  await Recorder.instance("chqBalance", "https://www.google.com", ["SearchFor"]);
// const recorder =  await Recorder.instance("chqBalance", "https://www.google.com");
await sleep(3000);
const selected = await recorder.setRequiredValue("SearchFor");
console.log("Value " + selected.text);
// Now try and auto-input value
// await new Promise(resolve => setTimeout(resolve, 2 * 1000));
// const r = await recorder.setDynamicInput("SearchFor", "Chicken");
// console.log("Selector " + r)

// // Check result
// await new Promise(resolve => setTimeout(resolve, 3 * 1000));
// const result = await recorder.setRequiredValue("SearchResult");
// console.log("Result " + result.text);

// const events = recorder.events;
// await Recorder.release("chqBalance");
await recorder.disconnected;

if (doReplay) {
    const { page, browser } = await startPuppeteer();
    const r = await replayEvents(page, events, undefined, {
        SearchFor: "Chicken",
    })
    console.log(JSON.stringify(r));
    await page.close();
    await browser.close();
}



