import { IsManualRun, describe } from "@thecointech/jestutils";
import { Dumper } from "./dumper";
import { newPage, closeBrowser } from "./puppeteer-init/init";
import path from "path";


describe('dumper', () => {
  it("Dumps page to folder", async () => {
    const { page } = await newPage("default", false);
    const dumper = new Dumper(path.join('..', 'temp', "wikipedia"), "test");
    await page.goto("https://www.wikipedia.org/");

    await dumper.dumpPage(page, "wikipedia");
    await closeBrowser();
  })
}, IsManualRun)
