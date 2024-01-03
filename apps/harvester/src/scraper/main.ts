import { getProcessConfig } from '../Harvester/config';
import { replayEvents } from './replay';
import { AnyEvent } from './types';

console.log("Testing stuff");

process.env.RUN_SCRAPER_HEADLESS = "false";
(async () => {
    // await initConfig();

    const config = await getProcessConfig();
    let events: AnyEvent[] = config?.scraping?.chqBalance ?? [];

    // const recorder =  await Recorder.instance("chqBalance", "https://en.wikipedia.org/wiki/Main_Page",
    // {
    //     SearchFor: "Chicken",
    // });
    // await new Promise(resolve => setTimeout(resolve, 40 * 1000));
    // const r = await recorder.setRequiredValue();
    // console.log("We got " + r.text)
    // await recorder.disconnected;
    // events = recorder.events;

    await replayEvents("chqBalance", events, {
        SearchFor: "Chicken",
    })
})();


