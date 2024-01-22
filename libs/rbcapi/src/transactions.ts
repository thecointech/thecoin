import { Page } from "puppeteer";
import { DateTime } from "luxon";
import type { BankTx } from "@thecointech/bank-interface"
import { ApiAction } from "./action";
import { downloadTxCsv } from "./transactionsDownload";
import { RbcStore } from "./store";
import csv from "csvtojson";

//
// Fetch, from storage or from live, all latest transactions
export async function fetchLatestTransactions() {
  const { txs, syncedTill } = await RbcStore.fetchStoredTransactions();
  const toDate = new Date();

  if (!sameDay(syncedTill, toDate)) {
    const newTxs = await getTransactions(syncedTill, toDate);
    await RbcStore.storeTransactions(newTxs, toDate);
    return [...txs, ...newTxs];
  }
  return txs;
}

//
// Get all transactions between from & to from bank acc
export async function getTransactions(from: Date, to = new Date(), accountNo = ApiAction.Credentials.accountNo): Promise<BankTx[]> {
  const act = await ApiAction.New('getTransactions', true);
  const { page } = act;

  // newest possible date is yesterday
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - 1);
  to.setTime(Math.min(to.getTime(), maxDate.getTime()));

  // Go to CAD account
  await act.clickOnText("Current Account", 'a', ".search-title");
  // To to download transactions
  await act.clickOnText('Download transactions', "a");

  // Select the right format
  await page.click('#EXCEL');
  await act.writeStep('Excel');

  // Select the right account
  await selectAccount(page, accountNo);
  await act.writeStep('Select Account');

  // Select date range
  await page.click('#fromRange > input');

  await selectTxDate(page, 'from', from);
  await selectTxDate(page, 'to', to);

  await act.writeStep('Input download details');

  const downloadButton = await page.$('#id_btn_download');
  if (!downloadButton)
    throw new Error('We have no download button');

  const asString = await downloadTxCsv(act.page);

  const maybeParse = (s?: string) => s ? parseFloat(s) : undefined;
  const toDateTime = (date: string) => DateTime.fromFormat(date, "L/d/yyyy", RbcStore.Options);
  const obj = await csv({
    ignoreEmpty: true,
    ignoreColumns: /field9/,
    colParser: {
      ["Transaction Date"]: toDateTime,
      ["Cheque Number"]: maybeParse,
      ["CAD$"]: maybeParse,
      ["USD$"]: maybeParse,
    }
  }).fromString(asString);

  // Remove spaces and '$' from names
  return obj.map(cleanTransaction);
}

const newTransaction  = (): BankTx => ({
  AccountType: "DEFAULT_VALUE",
  AccountNumber: "DEFAULT_VALUE",
  TransactionDate: DateTime.fromMillis(0)
})
const cleanName = (name: string) => name.replace(/[\s\$]/g, '');
const cleanTransaction = (obj: object) : BankTx =>
  Object.entries(obj)
    .reduce((r, et) => ({
      ...r,
      [cleanName(et[0])]: et[1]
    }), newTransaction())


/////////////////////////////////////////////////////////////
// Utilities

const selectAccount = async (page: Page, accountNo: string) => {
  await page.evaluate((selectId, accountNo) => {
    const options = Array.from(document.querySelectorAll(selectId + ' option'));
    for (const option of options) {
      if (option.textContent?.includes(accountNo)) {
        // @ts-ignore: ts type error but cannot put type assertions in this code
        option.selected = true;
      }
    }
  }, '#ACCOUNT_INFO1', accountNo)
}

const selectTxDate = async (page: Page, fromTo: string, date: Date) => {
  // Select month
  await page.select(`#${fromTo}-month`, (date.getMonth() + 1).toString());
  // Select day
  await page.select(`#${fromTo}-day`, date.getDate().toString());
  // Select year
  await page.select(`#${fromTo}-year`, date.getFullYear().toString());
}

function sameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}
