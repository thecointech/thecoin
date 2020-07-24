import puppeteer, { Browser, Page } from 'puppeteer';
import credentials from './credentials.json';
import fs from 'fs';

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

  async findElementsWithText(elementType: string, searchText: string) {
    return this.page.$x(`//${elementType}[contains(., '${searchText}')]`);
  }

  async clickOnLinkText(linkText: string, waitElement?: string, stepName?: string) {
    const [link] = await this.findElementsWithText('a', linkText);
    if (!link)
      throw (`Could not find link: ${linkText}`)

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

  public async selectTxDate(fromTo: string, date: Date) {
    // Select month
    await this.page.select(`#${fromTo}-month`, (date.getMonth() + 1).toString());
    // Select day
    await this.page.select(`#${fromTo}-day`, date.getDate().toString());
    // Select year
    await this.page.select(`#${fromTo}-year`, date.getFullYear().toString());
  }
}
