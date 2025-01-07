import { IsManualRun, describe } from "@thecointech/jestutils";
import { Dumper } from "./dumper";
import { startPuppeteer, closeBrowser } from "./puppeteer-init";
import path from "path";


describe('dumper', () => {
  it("Dumps page to folder", async () => {
    const { page } = await startPuppeteer(false);
    const dumper = new Dumper(path.join('..', 'temp', "wikipedia"), "test");
    await page.goto("https://www.wikipedia.org/");

    await dumper.dumpPage(page, "wikipedia");
    await closeBrowser();
  })
}, IsManualRun)
