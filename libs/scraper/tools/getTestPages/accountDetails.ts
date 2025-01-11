import type { Page } from "puppeteer";
import { GetAccountSummaryApi, GetCreditDetailsApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { clickElement, responseToElement } from "./vqaResponse";
import { ElementData } from "../../src/types";
import { AccountResponse, ElementResponse } from "@thecointech/vqa";
import { extractFuzzyMatch } from "./extractFuzzyMatch";
import { AccountSummary } from "./types";

export class AccountDetailsWriter extends IntentWriter {

  static async process(page: Page, name: string, account: AccountResponse) {
    log.trace("AccountDetailsWriter: begin processing");
    const writer = new AccountDetailsWriter(page, name, "AccountDetails");
    await writer.gotoAccount(account);
    await writer.setNewState("initial");
    await writer.saveCurrentBalance();
    await writer.saveDueDate();
    await writer.saveDueAmount();
    await writer.savePending();
    return writer.updatePageIntent();
  }

  async gotoAccount(account: AccountResponse) {

    const { data: nav } = await GetAccountSummaryApi().accountNavigateElement(account.account_number, await this.getImage());
    const didClick = await this.completeInteraction(nav, "navigate", (found) => clickElement(this.page, found), "a");
    await this.waitForPageLoaded();
    // We should be on the account details page now
    const intent = await this.updatePageIntent();
    // if (intent != "AccountDetails") {
    //   throw new Error("Failed to get to AccountDetails");
    // }
  }

  async saveCurrentBalance() {
    log.trace("AccountDetailsWriter: saving current balance");
    const { data: balance } = await GetCreditDetailsApi().currentBalance(await this.getImage());
    await this.saveElementJson(balance, "balance");
  }

  async savePending() {
    log.trace("AccountDetailsWriter: saving pending");
    const { data: pending } = await GetCreditDetailsApi().currentPending(await this.getImage());
    if (pending.pending_exists) {
      await this.saveElementJson(pending.pending_element, "pending");
    }
  }

  async saveDueDate() {
    log.trace("AccountDetailsWriter: saving due date");
    const { data: dueDate } = await GetCreditDetailsApi().currentDueDate(await this.getImage());
    await this.saveElementJson(dueDate, "due-date");
  }

  async saveDueAmount() {
    log.trace("AccountDetailsWriter: saving due amount");
    const { data: dueAmount } = await GetCreditDetailsApi().currentDueAmount(await this.getImage());
    await this.saveElementJson(dueAmount, "due-amount");
  }

  async saveElementJson(response: ElementResponse, eventName: string) {
    this.saveJson(response, `vqa-${eventName}`);
    const found = await responseToElement(this.page, response);
    this.saveJson(found.data, eventName);
  }
}
