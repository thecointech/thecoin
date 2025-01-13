import type { Page } from "puppeteer";
import { GetAccountSummaryApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { accountToElementResponse, clickElement, responseToElement } from "./vqaResponse";
import { ElementData } from "../../src/types";
import { AccountResponse, ElementResponse } from "@thecointech/vqa";
import { extractFuzzyMatch } from "./extractFuzzyMatch";
import { ProcessConfig } from "./types";
import { FoundElement } from "../../src/elements";

export class AccountSummaryWriter extends IntentWriter {

  static async process(config: ProcessConfig) {
    log.trace("AccountSummaryWriter: begin processing");
    const writer = new AccountSummaryWriter(config, "AccountSummary");
    // Currently, we don't actually do anything, just list the accounts and move on...
    return writer.listAccounts();
  }

  async listAccounts() {
    const api = GetAccountSummaryApi();
    // Get a list of all accounts
    const { data: accounts } = await api.listAccounts(await this.getImage());
    this.writeJson(accounts, "vqa-list-accounts");
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
    this.writeJson(allAccounts, "list-accounts");

    // Update inferred with the real account numbers, then save balance/navigation
    let r : { account: AccountResponse, nav: FoundElement}[] = [];
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
      // Validate we can navigate (in case we need more)
      const nav = await this.saveAccountNavigation(accountNumber);
      if (nav) {
        r.push({
          account,
          nav
        });
      }
    }
    return r;
  }


  async saveBalanceElement(account_number: string) {
    const { data: balance } = await GetAccountSummaryApi().accountBalanceElement(account_number, await this.getImage());
    await this.toElement(balance, "balance", undefined, undefined, {
      accountNumber: account_number,
    });
  }

  async saveAccountNavigation(account_number: string) {
    const { data: nav } = await GetAccountSummaryApi().accountNavigateElement(account_number, await this.getImage());
    return await this.toElement(nav, "navigate", "a", undefined, {
      accountNumber: account_number,
    });
  }
}
