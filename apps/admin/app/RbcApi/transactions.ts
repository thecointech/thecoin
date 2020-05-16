import { Page } from "puppeteer";

import { DateTime } from "luxon";
import { trimQuotes } from "utils";
import { RbcTransaction } from "./types";
import { ApiAction } from "./action";
import { downloadTxCsv } from "./transactionsDownload";
import { RbcStore } from "./RbcStore";
import credentials from './credentials.json';

//
// Fetch, from storage or from live, all latest transactions
//
export async function fetchLatestTransactions()
{
  const { txs, syncedTill}  = await RbcStore.fetchStoredTransactions();
  // newest possible date is yesterday
  const toDate = new Date();
  toDate.setDate(toDate.getDate()-1);

  if (!sameDay(syncedTill, toDate))
  {
    const newTxs = await this.getTransactions(syncedTill, toDate);
    await RbcStore.storeTransactions(newTxs, toDate);
    return [...txs, ...newTxs];
  }
  return txs;
}

//
// Get all transactions between from & to from bank acc
//
export async function getTransactions(from: Date, to: Date) : Promise<RbcTransaction[]> {
  const act = await ApiAction.New('getTransactions', true);
  const { page } = act;

  // Go to CAD account
  await act.clickOnLinkText(credentials.accountNo, '#search-transaction');
  // To to download transactions
  await act.clickOnLinkText('Download Transactions', '#ACCOUNT_INFO1');

  // Select the right format
  await page.click('#EXCEL');
  await act.writeStep('Excel');
  // Select the right account
  await page.select('#ACCOUNT_INFO1', 'C001');
  await act.writeStep('Select Account');
  // Select date range
  await page.click('#fromRange > input');

  await selectTxDate(page, 'from', from);
  await selectTxDate(page, 'to', to);

  await act.writeStep('Input download details');

  const downloadButton = await page.$('#id_btn_download');
  if (!downloadButton)
    throw new Error('We have no download button');

  const txs = await downloadTxCsv(act.page);

  const maybeParse = (s?: string) => s ? parseFloat(s) : undefined;
  const toDateTime = (date: string) => DateTime.fromFormat(date, "L/d/yyyy", credentials.TimeZone);

  const allLines = txs.split('\n');
  return allLines
    .slice(1)
    .map(line => line.split(','))  // Split into component pieces
    .filter(entry => entry[1] == credentials.accountNo) // Do not accept any line that does not have the right account type 
    .map((entry) : RbcTransaction =>  ({
        AccountType: entry[0],
        AccountNumber: entry[1],
        TransactionDate: toDateTime(entry[2]),
        ChequeNumber: maybeParse(entry[3]),
        Description1: trimQuotes(entry[4]),
        Description2: trimQuotes(entry[5]),
        CAD: maybeParse(entry[6]),
        USD: maybeParse(entry[7]),
      })
    )
}

/////////////////////////////////////////////////////////////
// Utilities

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