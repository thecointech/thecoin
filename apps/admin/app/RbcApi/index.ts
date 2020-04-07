import puppeteer from 'puppeteer';
import credentials from './credentials.json';
import fs from 'fs';

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

export class RbcApi {

  browser: puppeteer.Browser
  constructor() {
    
  
  }

  async initialize()
  {
    this.browser = await puppeteer.launch();
    this.browser.on('disconnected', () => this.initialize());
  }



  async depositETransfer(prefix: string, url: string, code: string, progressCb: (v: string) => void) : Promise<DepositResult>
  {
    try {
      return this.completeDeposit(prefix, url, code, progressCb);
    }
    catch(e) {
      return this.getErrorResult(JSON.stringify(e))
    }
  }

  async completeDeposit(prefix: string, url: string, code: string, progressCb: (v: string) => void): Promise<DepositResult>
  {
    progressCb("Initializing Bank API");

    const outCache = `/temp/rbcapi/${prefix}`;
    fs.mkdirSync(outCache, {recursive: true});

    const {browser} = this;
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({path: `${outCache}/step0 - Select Bank.png`});

    // Find the link to RBC and click it.
    const rbcLogo = await page.$("#fi-logo-CA000003 > img");
    if (rbcLogo == null) {
      return this.findErrorResult(page); // TODO: figure out what went wrong?
    }

    rbcLogo.click();
    await page.waitForSelector("#K1");
    await page.screenshot({path: `${outCache}/step1 - Enter username & pwd.png`});

    progressCb("Connecting Bank API");

    // Enter user name and passwords
    await page.type('#K1', credentials.cardNo, {delay: 20});
    await page.type('#Q1', credentials.password, {delay: 20});
    await page.screenshot({path: `${outCache}/step1 - Entered data.png`});
    const navigationWaiter = page.waitForNavigation();
    await page.click('#rbunxcgi > fieldset > div.formBlock.formBlock_mainSignIn > div > button')
    await navigationWaiter;
    await page.screenshot({path: `${outCache}/step2 - Logged In.png`});

    progressCb("Entering Deposit Details");

    // Input the code.  It's possible that RBC might skip this 
    // page if we have previously attempted to deposit this but not been completely successful
    const input = await page.$("input[name=CP_RESPONSE]");
    if (input != null)
    {
      await page.type('input[name=CP_RESPONSE]', code, {delay: 20});
      await page.screenshot({path: `${outCache}/step2.5 - Enter Code.png`});
      await page.click('#id_btn_continue');
      await page.waitForNavigation();
    }
    if (await page.$("#id_btn_submit") == null) {
      // Something has gone wrong.  Notify upstairs:
      return this.getErrorResult("Cannot find either code entry or button to continue: Bailing");
    }
    // All good, lets continue.
    await page.screenshot({path: `${outCache}/step3 - Select To Account.png`});

    progressCb("Awaiting Confirmation");

    // Click through to deposit the money
    const navigate = page.waitForNavigation();
    await page.click('#id_btn_submit');
    await navigate;
    await page.screenshot({path: `${outCache}/step4 - Confirmation.png`});

    // Click through to deposit the money
    const nav = page.waitForNavigation();
    await page.click('#id_btn_confirm');
    await nav;
    await page.screenshot({path: `${outCache}/step5 - All Done.png`});

    return {
      message: 'All done',
      code: ETransferErrorCode.Success,
    };
  }

  async findErrorResult(page: puppeteer.Page) {

    const allH3 = await page.$$("h3.font-weight-100");
    const allContents = await Promise.all(allH3.map(el => page.evaluate(el => el.textContent, el)))
    const reason = allContents.find(s => s.match(/\([0-9]+\)/) != null)
    const str = reason?.trim() ?? "We don't know what went wrong."
    return this.getErrorResult(str);
  }

  getErrorResult(mssg: string) : DepositResult {
    const match = mssg.match(/^(.+)\(([0-9]+)\)\s*$/);
    if (match)
    {
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

}

