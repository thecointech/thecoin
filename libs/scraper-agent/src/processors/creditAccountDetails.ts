import { GetCreditDetailsApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";
import { ElementData } from "../types";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { clickElement } from "../vqaResponse";

export async function CreditAccountDetails(page: PageHandler, navData: ElementData) {
  log.trace("AccountDetailsWriter: begin processing");

  // First, we have to navigate to the page...
  // they start on their initial page.
  await navigateToAccountDetails(page, navData);
  await saveCurrentBalance(page);
  await saveDueDate(page);
  await saveDueAmount(page);
  await savePending(page);
}

async function navigateToAccountDetails(page: PageHandler, navData: ElementData) {
  // Refresh the element, it's possible the page has navigated since it was found
  const navElement = await getElementForEvent(page.page, navData);

  // First, we have to navigate to the page...
  const navigated = await clickElement(page.page, navElement);
  if (!navigated) {
    log.error("Failed to navigate to account details page");
  }

  // Check that we are on the correct page
  const intent = await page.getPageIntent();
  if (intent != "CreditAccountDetails") {
    log.error(`Navigated to wrong page: ${intent}`);
  }
}

async function saveCurrentBalance(page: PageHandler) {
  log.trace("AccountDetailsWriter: saving current balance");
  const { data: balance } = await GetCreditDetailsApi().currentBalance(await page.getImage());
  await page.pushValueEvent(balance, "balance", "currency");
}

async function savePending(page: PageHandler) {
  log.trace("AccountDetailsWriter: saving pending");
  const { data: pending } = await GetCreditDetailsApi().currentPending(await page.getImage());
  if (pending.pending_exists) {
    await page.pushValueEvent(pending.pending_element, "pending", "currency");
  }
}

async function saveDueDate(page: PageHandler) {
  log.trace("AccountDetailsWriter: saving due date");
  const { data: dueDate } = await GetCreditDetailsApi().currentDueDate(await page.getImage());
  await page.pushValueEvent(dueDate, "dueDate", "date");
}

async function saveDueAmount(page: PageHandler) {
  log.trace("AccountDetailsWriter: saving due amount");
  const { data: dueAmount } = await GetCreditDetailsApi().currentDueAmount(await page.getImage());
  await page.pushValueEvent(dueAmount, "dueAmount", "currency");
}
