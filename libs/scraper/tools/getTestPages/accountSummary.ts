import type { Page } from "puppeteer";
import { GetAccountSummaryApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { accountToElementResponse, clickElement, responseToElement } from "./vqaResponse";
import { ElementData } from "../../src/types";
import { AccountResponse, Crop, ElementResponse } from "@thecointech/vqa";
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
    let r: { account: AccountResponse, nav: FoundElement }[] = [];
    for (let i = 0; i < accounts.accounts.length; i++) {
      // Just use the first account (maybe later we'll store them all)
      const inferred = accounts.accounts[i];
      const scraped = allAccounts[i];
      const accountNumber = updateAccountNumber(inferred, scraped);

      // Crop to just the area of the account in the list.  This is because
      // VQA needs a bit of help focusing on the account
      const viewport = this.page.viewport();
      const crop = getCropFromElements([scraped], viewport);
      // Validate we can find the balance, as that is all some accounts need

      await this.saveBalanceElement(accountNumber, crop);
      // Validate we can navigate (in case we need more)
      const nav = await this.saveAccountNavigation(accountNumber, crop);
      if (nav) {
        r.push({
          account: inferred,
          nav
        });
      }
    }
    return r;
  }

  async saveBalanceElement(account_number: string, crop: Crop) {
    // Don't search the whole page, just the area around the account listing
    const { data: balance } = await GetAccountSummaryApi().accountBalanceElement(account_number, await this.getImage(), crop.top, crop.bottom);
    await this.toElement(balance, "balance", undefined, undefined, {
      accountNumber: account_number,
    });
  }

  async saveAccountNavigation(account_number: string, crop: Crop) {
    const { data: nav } = await GetAccountSummaryApi().accountNavigateElement(account_number, await this.getImage(), crop.top, crop.bottom);
    return await this.toElement(nav, "navigate", "a", undefined, {
      accountNumber: account_number,
    });
  }
}

export function updateAccountNumber(inferred: AccountResponse, scraped: ElementData) {
  const inferredAccountNumber = inferred.account_number;
  const realAccountText = scraped.text;
  // The inferred number may be off by a few digits
  const { match: accountNumber } = extractFuzzyMatch(inferredAccountNumber, realAccountText);
  // Update original
  log.trace(`Updating account number from inferred: ${inferredAccountNumber} to ${accountNumber}`);
  inferred.account_number = accountNumber;
  return accountNumber;
}

// type Crop = [left: number, top: number, right: number, bottom: number];
// Processing the larger screenshot can result in errors reading small text.
// This function will focus in on the area containing the elements (vertically only)
function getCropFromElements(elements: ElementData[], viewport: { width: number, height: number }, buffer = 200) {
  const all_posY = elements.map(el => el.coords.centerY);
  const max_posY = Math.round(Math.max(...all_posY));
  const min_posY = Math.round(Math.min(...all_posY));
  return {
    left: 0,
    top: Math.max(max_posY - buffer, 0),
    right: viewport.width,
    bottom: Math.min(min_posY + buffer, viewport.height)
  };
}
