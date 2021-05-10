import puppeteer, { Browser, Page, NavigationOptions } from 'puppeteer';
import fs from 'fs';
import { log } from '@thecointech/logging';
import { Credentials } from './types';

////////////////////////////////////////////////////////////////
// API action, a single-shot action created by the API.
// Wraps a puppeteer page to ensure issues with one
// action do not affect synchronous actions.

let _browser: Browser | null = null;
export async function initBrowser(options?: puppeteer.LaunchOptions) {
  _browser = await puppeteer.launch(options);
  _browser.on('disconnected', initBrowser);
  return _browser;
}

async function getPage() {
  const browser = _browser ?? await initBrowser();
  return browser.newPage();
}

export class ApiAction {

  static Credentials: Credentials;

  page!: Page;
  navigationPromise!: Promise<puppeteer.Response>;
  outCache: string;
  step: number = 0;

  private constructor(identifier: string) {
    this.outCache = `/temp/TheCoin/logs/rbcapi/Screenshots/${identifier}`;
    fs.mkdirSync(this.outCache, { recursive: true });
  }

  private async init()
  {
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
    await this.page.type('#K1', ApiAction.Credentials.cardNo, { delay: 20 });
    await this.page.type('#QQ', ApiAction.Credentials.password, { delay: 20 });
    await this.writeStep('Entered Sign-in details');

    await this.clickAndNavigate('#rbunxcgi > fieldset > div.formBlock.formBlock_mainSignIn > div > button', 'Logged In', { waitUntil: "networkidle0"})

    // If we hit PVQ, this is where that happens
    await this.maybeEnterPVQ();
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
        log.error({pvq: pvQuestion}, "Cannot match PVQ {pvq} with existing questions");
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
    log.debug({pvq}, "Found question: {pvq}")
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

  async clickAndNavigate(selector: string, stepName: string, options?: NavigationOptions) {
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
    await this.page.screenshot({ path: `${this.outCache}/step${this.step} - ${action}.png` });
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
