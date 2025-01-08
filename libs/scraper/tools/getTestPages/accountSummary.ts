import type { Page } from "puppeteer";
import { GetAccountSummaryApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { IAskUser } from "./askUser";
import { responseToElement } from "./vqaResponse";
import { ElementData } from "../../src/types";
import { ElementResponse } from "@thecointech/vqa";

export class AccountSummaryWriter extends IntentWriter {

  static async process(page: Page, name: string) {
    log.trace("AccountSummaryWriter: begin processing");
    const writer = new AccountSummaryWriter(page, name, "Login");
    await writer.setNewState("initial");
    // Currently, we don't actually do anything, just list the accounts and move on...
    await writer.listAccounts();
    return await writer.updatePageIntent();
  }

  async listAccounts() {
    const api = GetAccountSummaryApi();
    // Get a list of all accounts
    const { data: accounts } = await api.listAccounts(await this.getImage());
    // Click on each account
    const allAccounts: ElementData[] = [];
    for (const account of accounts.accounts) {
      console.log(account);
      // Find the balance element for this account
      const { data: balance } = await api.accountBalanceElement(account.account_number, await this.getImage());
      const found = await responseToElement(this.page, balance);
      if (found) {
        const data = {
          ...found.data,
          extra: {
            accountType: account.account_type
          }
        };
        allAccounts.push(data);
      }
    }
    this.saveJson(allAccounts, "list-accounts");

    // Just use the first account (maybe later we'll store them all)
    const accountNumber = accounts.accounts[0].account_number;
    await this.saveBalanceElement(accountNumber);
    await this.saveAccountNavigation(accountNumber);
  }

  async saveBalanceElement(account_number: string) {
    const { data: balance } = await GetAccountSummaryApi().accountBalanceElement(account_number, await this.getImage());
    await this.saveElementJson(balance, account_number, "balance");
  }

  async saveAccountNavigation(account_number: string) {
    const { data: nav } = await GetAccountSummaryApi().accountNavigateElement(account_number, await this.getImage());
    await this.saveElementJson(nav, account_number, "navigate");
  }

  async saveElementJson(response: ElementResponse, account_number: string, eventName: string) {
    const found = await responseToElement(this.page, response);
    if (!found) {
      throw new Error("Failed to find element for " + eventName);
    }
    this.saveJson({
      ...found.data,
      extra: {
        accountNumber: account_number
      }
    }, eventName);
  }
}



