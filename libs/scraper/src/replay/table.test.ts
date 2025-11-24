import puppeteer from "puppeteer"
import { jest } from "@jest/globals"
import { registerElementAttrFns } from "../elements";
import { getRawTxData, getTableData } from "./table";
import { describe, IsManualRun } from '@thecointech/jestutils';
import { sleep } from "@thecointech/async";
jest.setTimeout(10 * 60 * 1000);


describe ('Table tests', () => {
  it('Reads table data', async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage()
    await page.setBypassCSP(true);

    await registerElementAttrFns(page);

    for (const { file, searchFor } of TestFiles) {
      // (todo: add this to a config file)
      await page.goto(`file:///${process.env.EXTERNAL_TEST_FILES}/${file}`);
      // Wait for load
      await sleep(500);

      const table = await getTableData(page);

      for (const { amount, date } of searchFor) {
        const payment = table.find(r =>
          r.values.find(v => v.value == amount)
        );
        expect(payment.date.toSQLDate()).toEqual(date)
      }
    }
    await browser.close();
  })
}, IsManualRun)


const TestFiles = [
  {
    file: "sample1.mhtml",
    searchFor: [
      {
        amount: 5.59,
        date: "2024-08-10",
      },
      {
        amount: 3862.14,
        date: "2024-08-05",
      },
      {
        amount: 5.65,
        date: "2024-06-17",
      }
    ]
  },
  {
    file: "sample2.mhtml",
    searchFor: [
      {
        amount: 9715.12,
        date: "2024-08-02",
      },
      {
        amount: 3862.14,
        date: "2024-08-05",
      },
      {
        amount: 40.00,
        date: "2024-08-01",
      }
    ]
  },
  {
    file: "sample3.mhtml",
    searchFor: [
      {
        amount: 10840.84,
        date: "2024-07-30",
      },
      {
        amount: 7005.49,
        date: "2024-08-06",
      },
      {
        amount: 2.00,
        date: "2024-08-01",
      }
    ]
  },
  {
    file: "sample4.mhtml",
    searchFor: [
      {
        amount: 84.27,
        date: "2024-09-25",
      },
      {
        amount: 25,
        date: "2024-09-19",
      },
      {
        amount: 10,
        date: "2024-09-02",
      }
    ]
  },
]
