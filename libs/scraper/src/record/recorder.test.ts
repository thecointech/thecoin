import { Recorder } from './recorder';
import { newPage } from '../puppeteer-init/newPage';
import { describe, IsManualRun } from '@thecointech/jestutils';

describe('Recorder', () => {
  it ('should record events', async () => {
    let hasEvents = false;
    process.env.RUN_SCRAPER_VISIBLE = "true";
    const { page, browser } = await newPage("default");
    const recorder = new Recorder({
      name: "test",
      context: "default",
    });
    recorder.onEvent((ev) => {
      console.log(ev);
      hasEvents = true;
    });
    await recorder.initialize(page);
    await recorder.goto("https://example.com");
    await browser.close();
    expect(hasEvents).toBe(true);
  })
}, IsManualRun)
