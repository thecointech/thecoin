import puppeteer, { Browser, Page } from 'puppeteer';
import credentials from './credentials.json';
import fs from 'fs';
import { RbcTransaction } from './types';
import { getLastInsertDate, storeTransactions, fetchStoredTransactions } from './RbcStore';
//import path from 'path';

export enum ETransferErrorCode {
  UnknownError = -1,
  Success = 0,
  AlreadyDeposited = 2,
  Cancelled = 38,
}

export type DepositResult = {
  message: string,
  code: ETransferErrorCode,
}

let _browser: Browser | null = null;
async function initBrowser() {
  _browser = await puppeteer.launch({headless: false});
  _browser.on('disconnected', initBrowser);
  return _browser;
}
async function getPage() {
  const browser = _browser ?? await initBrowser();
  return browser.newPage();
}

export class RbcApi {

  async depositETransfer(prefix: string, url: string, code: string, progressCb: (v: string) => void): Promise<DepositResult> {
    try {
      return this.completeDeposit(prefix, url, code, progressCb);
    }
    catch (e) {
      return getErrorResult(JSON.stringify(e))
    }
  }

  async fetchLatestTransactions()
  {
    const storedTxs = await fetchStoredTransactions();
    const fromDate = getLastInsertDate();
    // newest possible date is yesterday
    const toDate = new Date();

    if (!sameDay(fromDate, toDate))
    {
      toDate.setDate(toDate.getDate()-1);
      const newTxs = await this.getTransactions(fromDate, toDate);
      if (newTxs.length)
      {
        await storeTransactions(newTxs, toDate);
      }
    }
    return storedTxs;
  }

  async getTransactions(from: Date, to: Date) : Promise<RbcTransaction[]> {
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

    await this.selectTxDate(page, 'from', from);
    await this.selectTxDate(page, 'to', to);

    await act.writeStep('Input download details');

    const downloadButton = await page.$('#id_btn_download');
    if (!downloadButton)
      throw new Error('We have no download button');

    const txs = await act.downloadTxCsv();

    const maybeParse = (s?: string) => s ? parseFloat(s) : undefined;

    const allLines = txs.split('\n');
    return allLines
      .slice(1)
      .map(line => {
        const entries = line.split(',');
        const v: RbcTransaction = {
          AccountType: entries[0],
          AccountNumber: entries[1],
          TransactionDate: new Date(`${entries[2]} EST`),
          ChequeNumber: maybeParse(entries[3]),
          Description1: entries[4],
          Description2: entries[5],
          CAD: maybeParse(entries[6]),
          USD: maybeParse(entries[7]),
        }
        return v;
      })
      .filter(tx => tx.AccountNumber == credentials.accountNo);
  }

  async selectTxDate(page: Page, fromTo: string, date: Date) {
    // Select month
    await page.select(`#${fromTo}-month`, (date.getMonth() + 1).toString());
    // Select day
    await page.select(`#${fromTo}-day`, date.getDate().toString());
    // Select year
    await page.select(`#${fromTo}-year`, date.getFullYear().toString());
  }

  async completeDeposit(prefix: string, url: string, code: string, progressCb: (v: string) => void): Promise<DepositResult> {
    progressCb("Initializing Bank API");

    const act = await ApiAction.New(prefix);
    const { page } = act;

    await page.goto(url);
    await act.writeStep('Select Bank');

    // Find the link to RBC and click it.
    const rbcLogo = await page.$("#fi-logo-CA000003 > img");
    if (rbcLogo == null) {
      return findErrorResult(page); // TODO: figure out what went wrong?
    }

    rbcLogo.click();
    await page.waitForSelector("#K1");
    await act.writeStep('Enter username & pwd');

    progressCb("Connecting Bank API");
    await act.login();

    progressCb("Entering Deposit Details");

    // Input the code.  It's possible that RBC might skip this
    // page if we have previously attempted to deposit this but not been completely successful
    const input = await page.$("input[name=CP_RESPONSE]");
    if (input != null) {
      await page.type('input[name=CP_RESPONSE]', code, { delay: 20 });
      await act.writeStep('Enter Code');
      await act.clickAndNavigate('#id_btn_continue', 'Select To Account')
    }
    if (await page.$("#id_btn_submit") == null) {
      // Something has gone wrong.  Notify upstairs:
      return getErrorResult("Cannot find either code entry or button to continue: Bailing");
    }

    progressCb("Awaiting Confirmation");

    // Click through to deposit the money
    await act.clickAndNavigate('#id_btn_submit', 'confirmation');

    // Click through to deposit the money
    await act.clickAndNavigate('#id_btn_confirm', 'All Done');

    // TODO: Confirm deposited amount!

    return {
      message: 'All done',
      code: ETransferErrorCode.Success,
    };
  }
}

////////////////////////////////////////////////////////////////

class ApiAction {

  page!: Page;
  outCache: string;
  step: number = 0;

  private constructor(identifier: string) {
    this.outCache = `/temp/rbcapi/${identifier}`;
    fs.mkdirSync(this.outCache, { recursive: true });
  }

  public static async New(identifier: string, login?: true) {
    const action = new ApiAction(identifier);
    action.page = await getPage();

    if (login) {
      await action.page.goto("https://www.rbcroyalbank.com/ways-to-bank/online-banking/index.html");
      await action.writeStep('Welcome');
      await action.clickAndNavigate("#header-sign-in-btn", 'Sign-in');
      await action.login();
    }
    return action;
  }

  public async login() {
    // Enter user name and passwords
    await this.page.type('#K1', credentials.cardNo, { delay: 20 });
    await this.page.type('#Q1', credentials.password, { delay: 20 });
    await this.writeStep('Entered Sign-in details');

    await this.clickAndNavigate('#rbunxcgi > fieldset > div.formBlock.formBlock_mainSignIn > div > button', 'Logged In')
  }

  async clickAndNavigate(selector: string, stepName: string) {
    const navigationWaiter = this.page.waitForNavigation({
      timeout: 90000 // MB internet means this can timeout prematurely
    });
    await this.page.click(selector)
    await navigationWaiter;
    await this.writeStep(stepName);
  }

  async clickOnLinkText(linkText: string, waitElement?: string, stepName?: string) {
    const [link] = await this.page.$x(`//a[contains(., '${linkText}')]`);
    if (!link)
      throw(`Could not find link: ${linkText}`)

    await link.click();
    await this.page.waitForNavigation();
    if (waitElement) {
      await this.page.waitForSelector(waitElement);
    }
    await this.writeStep(stepName ?? linkText);

    return null;
  }

  public async writeStep(action: string) {
    console.log(`step${this.step} - ${action}`);
    await this.page.screenshot({ path: `${this.outCache}/step${this.step} - ${action}.png` });
    this.step = this.step + 1;
  }


  /**
   * Clicks an element that kicks off a download, writes download to a file,
   * then returns the path to the file.
   *
   * Example usage:
   *
   * const downloadButton = await this.page.$('#downloadButton');
   * const myDownload = await clickToDownload(downloadButton, {
   *   downloadPath: '/path/to/save/to',
   *   filename: 'mydownload.csv'
   * });
   * console.log(`My file is now located in ${myDownload}.`);
   *
   * @param elementHandle Element handle to click.
   * @param options.resourceType Type of resource to watch for. (defaults to "xhr").
   * @param options.downloadPath Path to save file to (defaults to "/tmp").
   * @param options.filename Filename to save file as (defaults to the URL clicked).
   * @returns Path where file is downloaded to.
   */
  async downloadTxCsv(
    // elementHandle: puppeteer.ElementHandle,
    // options?: {
    //   resourceType?: puppeteer.ResourceType;
    //   downloadPath?: string;
    //   filename?: string
    //}
    ): Promise<string> {

    var csv = await this.page.evaluate(async () => {
      // taken from the page JS
      //@ts-ignore
      setSubmitVals();
      //@ts-ignore
      const form = document.PFM_FORM;
      const result = await fetch(form.action, {
        method: form.method,
        body: new URLSearchParams([...(new FormData(form) as any)])
      })
      return await result.text();
    });
    return csv
  }
}
      // const form = event.target as HTMLFormElement;

      //   // casting to any here to satisfy tsc
      //   // sending body as x-www-form-url-encoded
      //   const result = await fetch(form.action, {
      //     method: form.method,
      //     body: new URLSearchParams([...(new FormData(form) as any)])
      //   })  

    // Set default options.
    //const resourceType = options?.resourceType || 'xhr';
    // const downloadPath = options?.downloadPath || this.outCache;

    // await this.page.setRequestInterception(true);

    // return new Promise(async (resolve, reject) => {
    //   let paused = true;
    //   //let pausedRequests = [] as any[];

    //   this.page.on('request', async request => {
    //     //console.log('Requesting: ' + request.url());
    //     // if (paused) {
    //     //   pausedRequests.push(() => request.continue());
    //     // } else {
    //     //  paused = true; // pause, as we are processing a request now
    //     if (/*!paused && */isRequested(request, resourceType))
    //     {
    //       paused = false;
    //       await this.page.setRequestInterception(false);

    //       const shimmed: AxiosRequestConfig = {
    //         method: request.method(),
    //         url: request.url(),
    //         data: request.postData(),
    //         headers: request.headers()
    //       }
    //       let cookies = await this.page.cookies();
    //       shimmed.headers.Cookie = cookies.map(ck => ck.name + '=' + ck.value).join(';');
    //       const req = await Axios.request(shimmed);
    //       console.log("Did: " + req.statusText);
    //       if (req.status == 200)
    //         resolve(req.data)
    //       else
    //         reject(req.statusText);
    //     }
    //     // else if (paused) {
    //     //   pausedRequests.push(request);
    //     // }
    //     else if (paused) {
    //       request.continue();
    //     }
    //     //}
    //   });

      // this.page.on('requestfinished', async (request) => {
      //   const response = requestedResponse(request, options?.resourceType);
      //   if (response)
      //   {
      //     console.log('Processing now');
      //     try {
      //       const buffer = await response.buffer();
      //       console.log('Buffer' + buffer.length);
      //     }
      //     catch (e)
      //     {
      //      console.error(e);
      //     }
      //   }
      //   //nextRequest(); // continue with next request
      // });

      //this.page.on('requestfailed', nextRequest);

      // Create the listener.
      // const listener = async (response: puppeteer.Response) => {
      //   try {
      //     const url = response.url();
      //     console.log(`${response.request().resourceType()} - ${url} : ${response.headers()['content-type']} - ${response.headers()['content-length']}`);

      //     if (response.request().resourceType() === resourceType) {
      //       //const text = await response.text();
      //       //console.log(text);
      //       if (url)
      //         return;
      //       const file = await response.buffer();
      //       if (file.length == 0) {
      //         console.error("Zero length buffer downloaded");
      //         return;
      //       }

      //       // // If a filename is specified, use that. If not, use the URL requested
      //       // // but without any query parameters if any.
      //       const destFilename = options?.filename || url.split('/').pop()?.replace(/\?.*$/, '') || "download";
      //       const filePath = path.resolve(downloadPath, destFilename);
      //       console.log(filePath)

      //       // // Create a writable stream and write to it.
      //       const writeStream = fs.createWriteStream(filePath);
      //       writeStream.write(file, (err) => {
      //         if (err) reject(err);
      //         console.log(`Bytes written: ${writeStream.bytesWritten}`);
      //         onDone(filePath);
      //       });
      //     }
      //   }
      //   catch (e) {
      //     console.error(`${e.message} - ${e.stack}`);
      //   }
      // };

      // this.page.on('requestfinished', async (request) => {

      //   const response = request.response();
      //   if (!response)
      //     return;

      //   console.log(`Finished: ${request.url()}`);
      //   const contentLength = response.headers()['content-length'];
      //   if (contentLength && contentLength != '0') {
      //     console.log("With length: " + contentLength);
      //     // try {
      //     //   console.log('- fetching body of .mp4 file');
      //     //   const buffer = await response.buffer();
      //     //   console.log(`-- .mp4: OK: ${buffer.length}`);
      //     // } catch (e) {
      //     //   console.log(`-- .mp4: FAIL - ${e.message}`);
      //     // }
      //   }
      // });

      // When the file is saved, remove this listener, and return the file path.
      // const onDone = (filePath: string) => {
      //   console.log(`Done downloading to ${filePath}`);
      //   this.page.removeListener('request', listener);
      //   resolve(filePath);
      // };

      // Tell the page to start watching for a download then click the button
      // to start a download.
      // this.page.on('response', listener);
  //     await elementHandle.click();
  //   });
  // }
//}

// function isRequested(request: puppeteer.Request, resourceType?: puppeteer.ResourceType)
// {
//   const requestType = request.resourceType();
//   return !resourceType || requestType === resourceType;
// }

// function requestedResponse(request: puppeteer.Request, resourceType?: puppeteer.ResourceType) {

//   if (!isRequested(request, resourceType))
//     return null;
//   const response = request.response();
//   if (!response)
//     return null;

//   const requestType = request.resourceType();
//   const url = request.url();
//   const contentLength = response.headers()['content-length'];
//   console.log(`${requestType} - ${url} : ${response.headers()['content-type']} - ${contentLength}`);
//   return (contentLength)
//     ? response
//     : null;
// }



////////////////////////////////////////////////////////////////

async function findErrorResult(page: puppeteer.Page) {

  const allH3 = await page.$$("h3.font-weight-100");
  const allContents = await Promise.all(allH3.map(el => page.evaluate(el => el.textContent, el)))
  const reason = allContents.find(s => s.match(/\([0-9]+\)/) != null)
  const str = reason?.trim() ?? "We don't know what went wrong."
  return getErrorResult(str);
}

function getErrorResult(mssg: string): DepositResult {
  const match = mssg.match(/^(.+)\(([0-9]+)\)\s*$/);
  if (match) {
    return {
      message: match[1],
      code: parseInt(match[2])
    }
  }

  return {
    message: ` Unknown Error: ${mssg}`,
    code: ETransferErrorCode.UnknownError
  }
}


function sameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}