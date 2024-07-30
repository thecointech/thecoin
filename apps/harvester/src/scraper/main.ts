import { startPuppeteer } from './puppeteer';
import { Recorder } from './record';
import { replayEvents } from './replay';

console.log("Testing stuff");

process.env.RUN_SCRAPER_HEADLESS = "false";

let doReplay = true;

//    const config = await getProcessConfig();
//    let events: AnyEvent[] = config?.scraping?.chqBalance ?? [];

const recorder =  await Recorder.instance("chqBalance", "https://www.td.com/ca/en/personal-banking");
// const recorder =  await Recorder.instance("chqBalance", "https://www.google.com", ["SearchFor"]);
await new Promise(resolve => setTimeout(resolve, 3 * 1000));
const selected = await recorder.setRequiredValue("SearchFor");
console.log("Value " + selected.text);
// // Now try and auto-input value
// await new Promise(resolve => setTimeout(resolve, 2 * 1000));
// const r = await recorder.setDynamicInput("SearchFor", "Chicken");
// console.log("Selector " + r)

// // Check result
// await new Promise(resolve => setTimeout(resolve, 3 * 1000));
// const result = await recorder.setRequiredValue("SearchResult");
// console.log("Result " + result.text);

const events = recorder.events;
// await Recorder.release("chqBalance");
await recorder.disconnected;

if (doReplay) {
    const { page, browser } = await startPuppeteer();
    const r = await replayEvents(page, "chqBalance", events, {
        SearchFor: "Chicken",
    })
    console.log(JSON.stringify(r));
    await page.close();
    await browser.close();
}



