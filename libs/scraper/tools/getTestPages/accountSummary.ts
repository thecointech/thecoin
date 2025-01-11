import type { Page } from "puppeteer";
import { GetAccountSummaryApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { responseToElement } from "./vqaResponse";
import { ElementData } from "../../src/types";
import { AccountResponse, ElementResponse } from "@thecointech/vqa";
import { extractFuzzyMatch } from "./extractFuzzyMatch";

export class AccountSummaryWriter extends IntentWriter {

  static async process(page: Page, name: string) {
    log.trace("AccountSummaryWriter: begin processing");
    const writer = new AccountSummaryWriter(page, name, "AccountSummary");
    await writer.setNewState("initial");
    // Currently, we don't actually do anything, just list the accounts and move on...
    const r = await writer.listAccounts();
    // return await writer.updatePageIntent();
    return r;
  }

  async listAccounts() {
    const api = GetAccountSummaryApi();
    // Get a list of all accounts
    const { data: accounts } = await api.listAccounts(await this.getImage());
    this.saveJson(accounts, "vqa-list-accounts");
    log.trace(`Found ${accounts.accounts.length} accounts`);
    // Click on each account
    const allAccounts: ElementData[] = [];
    for (const account of accounts.accounts) {

      log.trace(`Processing account: ${account.account_number} - ${account.account_type} - ${account.balance}`);
      // Find the most likely element describing this account
      const found = await responseToElement(this.page, accountToElementResponse(account));

      // const found = await responseToElement(this.page, balance);
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

    // Update inferred with the real account numbers, then save balance/navigation
    for (const account of accounts.accounts) {
      // Just use the first account (maybe later we'll store them all)
      const inferredAccountNumber = account.account_number;
      const realAccountText = allAccounts[0].text;
      // The inferred number may be off by a few digits
      const { match: accountNumber } = extractFuzzyMatch(inferredAccountNumber, realAccountText);
      // Update original
      log.trace(`Updating account number from inferred: ${inferredAccountNumber} to ${accountNumber}`);
      account.account_number = accountNumber;

      // Validate we can find the balance, as that is all some accounts need
      await this.saveBalanceElement(accountNumber);
      await this.saveAccountNavigation(accountNumber);
    }
    return accounts.accounts;
  }


  async saveBalanceElement(account_number: string) {
    const { data: balance } = await GetAccountSummaryApi().accountBalanceElement(account_number, await this.getImage());
    await this.saveElementJson(balance, account_number, "balance");
  }

  async saveAccountNavigation(account_number: string) {
    const { data: nav } = await GetAccountSummaryApi().accountNavigateElement(account_number, await this.getImage());
    const element = await this.saveElementJson(nav, account_number, "navigate");
    return element.data;
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
    return found;
  }
}


export const accountToElementResponse = (account: AccountResponse) => ({
  position_x: account.position_x,
  position_y: account.position_y,
  background_color: "#f0f0f0",
  font_color: "#000000",
  neighbour_text: `${account.account_type}, ${account.balance}`,
  content: `${account.account_type} ${account.account_name} ${account.account_number} ${account.balance}`,
});
