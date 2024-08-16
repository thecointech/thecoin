import puppeteer from "puppeteer"
import { jest } from "@jest/globals"
import { registerElementAttrFns } from "./elements";
import { getTableData } from "./table";
import { describe, IsManualRun } from '@thecointech/jestutils';
import { sleep } from "@thecointech/async";
jest.setTimeout(10 * 60 * 1000);

describe ('Table tests', () => {
  it('Reads table data', async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage()
    await page.setBypassCSP(true);

    await registerElementAttrFns(page);

    await page.goto("file:///C:/src/scraper-samples/history/EasyWeb.mhtml");
    // Wait for load
    await sleep(500);

    const table = await getTableData(page, null);
    console.table(table.map(r => ({
      date: r.date.toSQLDate(),
      description: r.description,
      debit: r.debit?.format(),
      credit: r.credit?.format(),
      balance: r.balance?.format(),
    })));
  })
}, IsManualRun)
