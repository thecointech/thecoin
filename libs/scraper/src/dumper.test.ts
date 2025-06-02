import { IsManualRun, describe } from "@thecointech/jestutils";
import { Dumper } from "./dumper";
import { newPage, closeBrowser } from "./puppeteer-init/init";
import { VisibleOverride } from "./puppeteer-init/visibility";
import path from "path";


describe('dumper', () => {
  it("Dumps page to folder", async () => {
    const _ = new VisibleOverride(true);
    const { page } = await newPage("default");
    const dumper = new Dumper(path.join('..', 'temp', "wikipedia"), "test");
    await page.goto("https://www.wikipedia.org/");

    await dumper.dumpPage(page, "wikipedia");
    await closeBrowser();
  })
}, IsManualRun)
