import { jest } from "@jest/globals"
import { describe, IsManualRun } from '@thecointech/jestutils';
import { Browser } from "@puppeteer/browsers";
import { setupScraper } from "./setup";
import { newPage } from "./newPage";
import { installBrowser } from "./browser";
jest.setTimeout(10 * 60 * 1000);

describe ('browser types', () => {
  it ('launches firefox', async () => {
    setupScraper({
      type: Browser.FIREFOX,
      isVisible: () => Promise.resolve(true),
      rootFolder: "./.cache/",
    })

    // Install the browser (getting the system browser doesn't work yet)
    await installBrowser();
    const { browser } = await newPage();
    const version = await browser.version();
    expect(version).toContain("firefox");
    console.log("Done");
  })
}, IsManualRun)
