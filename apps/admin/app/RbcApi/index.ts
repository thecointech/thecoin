import puppeteer, { Browser, Page } from 'puppeteer';
import credentials from './credentials.json';
import fs from 'fs';
import path from 'path';

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
  _browser = await puppeteer.launch();
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

  async getTransactions(from: Date, to: Date) {
    const act = await ApiAction.New('getTransactions', true);
    const { page } = act;

    // Go to CAD account
    await act.clickOnLinkText('03631-1003342', '#search-transaction');
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

    // Allow downloads
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow', downloadPath: '/temp/'
    });
    
    await act.clickToDownload(downloadButton, {
      filename: 'transactions.csv',
      resourceType: 'document'
    });
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
    const navigationWaiter = this.page.waitForNavigation();
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
  async clickToDownload(
    elementHandle: puppeteer.ElementHandle,
    options?: {
      resourceType?: puppeteer.ResourceType;
      downloadPath?: string;
      filename?: string
    }): Promise<string> {

    // Set default options.
    const resourceType = options?.resourceType || 'xhr';
    const downloadPath = options?.downloadPath || this.outCache;

    return new Promise(async (resolve, reject) => {

      // Create the listener.
      const listener = async (response: any) => {
        try {
          const url = response.url();
          console.log(`${response.request().resourceType()} - ${url}`);
          console.log(`${response.headers()['content-type']} - ${response.headers()['content-length']}`);

          if (response.request().resourceType() === resourceType) {
            const text = await response.text();
            console.log(text);
            const file = await response.buffer();
            if (file.length == 0) {
              console.error("Zero length buffer downloaded");
              return;
            }

            // If a filename is specified, use that. If not, use the URL requested
            // but without any query parameters if any.
            const destFilename = (options?.filename)
              ? options!.filename
              : url.split('/').pop().replace(/\?.*$/, '');
            const filePath = path.resolve(downloadPath, destFilename);

            // Create a writable stream and write to it.
            const writeStream = fs.createWriteStream(filePath);
            writeStream.write(file, (err) => {
              if (err) reject(err);
              console.log(`Bytes written: ${writeStream.bytesWritten}`);
              onDone(filePath);
            });
          }
        }
        catch (e) {
          console.error(`${e.message} - ${e.stack}`);
        }
      };

      // When the file is saved, remove this listener, and return the file path.
      const onDone = (filePath: string) => {
        console.log(`Done downloading to ${filePath}`);
        this.page.removeListener('request', listener);
        resolve(filePath);
      };

      // Tell the page to start watching for a download then click the button 
      // to start a download.
      this.page.on('response', listener);
      await elementHandle.click();
    });
  }
}



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
