import puppeteer, { Browser, Page } from 'puppeteer';
import fs, { readFileSync } from 'fs';
import { log } from '@thecointech/logging';
import { AuthOptions, Credentials, isCredentials } from './types.js';

////////////////////////////////////////////////////////////////
// API action, a single-shot action created by the API.
// Wraps a puppeteer page to ensure issues with one
// action do not affect synchronous actions.

let _browser: Browser | null = null;
export async function initBrowser(options?: puppeteer.BrowserLaunchArgumentOptions) {
  _browser = await puppeteer.launch(options);
  _browser.on('disconnected', initBrowser);
  return _browser;
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}

async function getPage() {
  const browser = _browser ?? await initBrowser();
  return browser.newPage();
}

export class ApiAction {

  static Credentials: Credentials;

  static initCredentials(options?: AuthOptions) {
    if (isCredentials(options))
      ApiAction.Credentials = options;
    else if (options?.authFile) {
      // it's a json file
      const cred = readFileSync(options.authFile, 'utf8');
      ApiAction.Credentials = JSON.parse(cred);
    }
    else if (process.env.RBCAPI_CREDENTIALS) {
      // Use environment vars if available
      ApiAction.Credentials = JSON.parse(process.env.RBCAPI_CREDENTIALS);
    }
    else if (process.env.RBCAPI_CREDENTIALS_PATH) {
      // Use environment vars if available
      const cred = readFileSync(process.env.RBCAPI_CREDENTIALS_PATH, 'utf8');
      ApiAction.Credentials = JSON.parse(cred);
    }
    else {
      throw new Error('Cannot use RbcApi without credentials');
    }
  }

  page!: Page;
  navigationPromise!: Promise<puppeteer.HTTPResponse | null>;
  outCache?: string;
  step: number = 0;

  private constructor(identifier: string) {
    if (process.env.TC_LOG_FOLDER) {
      const base = process.env.TC_LOG_FOLDER;
      const illegalRe = /[\/\?<>\\:\*\|":]/g;
      const ident = identifier.replace(illegalRe, '_');
      this.outCache = `${base}/rbcapi/Screenshots/${ident}`;
      fs.mkdirSync(this.outCache, { recursive: true });
    }
  }

  private async init() {
    this.page = await getPage();
    this.navigationPromise = this.page.waitForNavigation()
  }

  public static async New(identifier: string, login?: true) {
    const action = new ApiAction(identifier);
    await action.init();

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
    log.debug("Beginning Login");

    // It seems we can hit 1 of 2 sign-in pages, depending on whether we
    // are depositing an e-transfer or signing into the regular bank ac.
    try {
      await this.page.waitForSelector("#K1", { timeout: 5000 });
      await this.loginOld()
    }
    catch {
      await this.loginNew();
    }

    // If we hit PVQ, this is where that happens
    await this.maybeEnterPVQ();
  }

  private async loginOld() {
    await this.page.type('#K1', ApiAction.Credentials.cardNo, { delay: 20 });
    await this.page.type('#QQ', ApiAction.Credentials.password, { delay: 20 });
    await this.clickAndNavigate("div.formBlock.formBlock_mainSignIn > div > button", "Logged In", { waitUntil: "networkidle0" });
  }

  private async loginNew() {
    await this.page.waitForSelector("#userName");
    await this.page.type('#userName', ApiAction.Credentials.cardNo, { delay: 20 });
    await this.clickAndNavigate('#signinNext', 'Entered Card Number', { waitUntil: "networkidle0" })

    await this.page.waitForSelector("#password");
    await this.page.type('#password', ApiAction.Credentials.password, { delay: 20 });
    await this.clickAndNavigate('#signinNext', 'Entered Pwd', { waitUntil: "networkidle0" })
  }

  public async maybeEnterPVQ() {
    log.debug("Searching for PVQ questions");
    var pvqAnswer = await this.page.$("#pvqAnswer");
    if (pvqAnswer != null) {
      log.debug("Found PVQ Anwser field");

      const pvQuestion = await this.findPVQuestion(pvqAnswer);
      if (pvQuestion == null)
        return;

      const pvq = ApiAction.Credentials.pvq.find(pvq => pvq.question == pvQuestion);
      if (pvq == null) {
        log.error({ pvq: pvQuestion }, "Cannot match PVQ {pvq} with existing questions");
        return;
      }

      await pvqAnswer.type(pvq.answer);
      await this.writeStep("PVQ");

      await this.clickAndNavigate("#id_btn_continue", "PVQ Passed");

      await this.maybeClickItWasMe();
    }
  }

  async findPVQuestion(answer: puppeteer.ElementHandle<Element>) {
    const pvqQuestion = await answer.$x("//INPUT[@id='pvqAnswer']/../../preceding-sibling::TR/TD[2]");
    if (pvqQuestion == null || pvqQuestion.length == 0) {
      log.error("Cannot find PVQ question");
      return null;
    }
    const pvq: string = await this.page.evaluate(el => el.innerText, pvqQuestion[0]);
    log.debug({ pvq }, "Found question: {pvq}")
    return pvq;
  }

  //
  // Navigate past the "Sign-in Protection Alert"
  // This may be the response if previous attempts failed
  async maybeClickItWasMe() {
    // If there has been a
    var pvqProtection = await this.page.$("#id_btn_thatwasme");
    if (pvqProtection != null) {
      await this.clickAndNavigate("#id_btn_thatwasme", "PVQ Passed");
    }
  }

  //////////////////////////////////////////

  async clickAndNavigate(selector: string, stepName: string, options?: puppeteer.WaitForOptions) {
    const navigationWaiter = this.page.waitForNavigation({
      timeout: 90000, // MB internet means this can timeout prematurely
      ...options
    });
    await this.page.click(selector)
    await navigationWaiter;
    await this.writeStep(stepName);
  }

  async findElementsWithText(elementType: string, searchText: string) {
    return this.page.$x(`//${elementType}[contains(., '${searchText}')]`);
  }

  async clickOnText(text: string, type: string, waitElement?: string, stepName?: string) {
    const [link] = await this.findElementsWithText(type, text);
    if (!link)
      throw (`Could not find element ${type} with text: ${text}`)

    await link.click();
    await this.page.waitForNavigation();
    if (waitElement) {
      await this.page.waitForSelector(waitElement);
    }
    await this.writeStep(stepName ?? text);

    return null;
  }

  public async writeStep(action: string) {
    log.debug(`step${this.step} - ${action}`);
    if (this.outCache) {
      await this.page.screenshot({ path: `${this.outCache}/step${this.step} - ${action}.png` });
    }
    this.step = this.step + 1;
  }

  public async selectTxDate(fromTo: string, date: Date) {
    // Select month
    await this.page.select(`#${fromTo}-month`, (date.getMonth() + 1).toString());
    // Select day
    await this.page.select(`#${fromTo}-day`, date.getDate().toString());
    // Select year
    await this.page.select(`#${fromTo}-year`, date.getFullYear().toString());
  }
}
