import { GetCreditDetailsApi } from "@thecointech/apis/vqa";
import { _getPageIntent, IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { ElementData, ProcessConfig } from "./types";
import { clickElement } from "./vqaResponse";
import { getElementForEvent } from "../../src/elements";
import { Page } from "puppeteer";

export class AccountDetailsWriter extends IntentWriter {

  static async process(config: ProcessConfig, navData: ElementData) {
    log.trace("AccountDetailsWriter: begin processing");

    // First, we have to navigate to the page...
    // Keep this separate, as the IntentWriters assume
    // they start on their initial page.
    await navigateToAccountDetails(config.recorder.page, navData);

    const writer = new AccountDetailsWriter(config, "AccountDetails");
    await writer.saveCurrentBalance();
    await writer.saveDueDate();
    await writer.saveDueAmount();
    await writer.savePending();
  }

  async saveCurrentBalance() {
    log.trace("AccountDetailsWriter: saving current balance");
    const { data: balance } = await GetCreditDetailsApi().currentBalance(await this.getImage());
    await this.toElement(balance, "balance");
  }

  async savePending() {
    log.trace("AccountDetailsWriter: saving pending");
    const { data: pending } = await GetCreditDetailsApi().currentPending(await this.getImage());
    if (pending.pending_exists) {
      await this.toElement(pending.pending_element, "pending");
    }
  }

  async saveDueDate() {
    log.trace("AccountDetailsWriter: saving due date");
    const { data: dueDate } = await GetCreditDetailsApi().currentDueDate(await this.getImage());
    await this.toElement(dueDate, "due-date");
  }

  async saveDueAmount() {
    log.trace("AccountDetailsWriter: saving due amount");
    const { data: dueAmount } = await GetCreditDetailsApi().currentDueAmount(await this.getImage());
    await this.toElement(dueAmount, "due-amount");
  }
}


async function navigateToAccountDetails(page: Page, navData: ElementData) {
  // Refresh the element, it's possible the page has navigated since it was found
  const navElement = await getElementForEvent(page, navData);

  // First, we have to navigate to the page...
  await clickElement(page, navElement);

  // Check that we are on the correct page
  const intent = await _getPageIntent(page);
  if (intent != "CreditAccountDetails") {
    log.error(`Navigated to wrong page: ${intent}`);
  }
}
