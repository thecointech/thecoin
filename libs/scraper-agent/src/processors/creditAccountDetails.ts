import { GetCreditDetailsApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";
import { ElementData, VisaBalanceResult } from "../types";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { clickElement } from "../vqaResponse";
import { processorFn } from "./types";

export const CreditAccountDetails = processorFn("CreditAccountDetails", async (page: PageHandler, navData: ElementData) => {
  log.trace("AccountDetailsWriter: begin processing");

  // First, we have to navigate to the page...
  // they start on their initial page.
  await navigateToAccountDetails(page, navData);
  page.onProgress(25);
  await saveCurrentBalance(page);
  page.onProgress(50);
  await saveDueDate(page);
  page.onProgress(75);
  await saveDueAmount(page);
  page.onProgress(100);
  await savePending(page);
}, true);

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
  const api = await GetCreditDetailsApi();
  const { data: balance } = await api.currentBalance(await page.getImage());
  await page.pushValueEvent<VisaBalanceResult>(balance, "balance", "currency");
}

async function savePending(page: PageHandler) {
  log.trace("AccountDetailsWriter: saving pending");
  const api = await GetCreditDetailsApi();
  const { data: pending } = await api.currentPending(await page.getImage());
  if (pending.pending_exists) {
    await page.pushValueEvent<VisaBalanceResult>(pending.pending_element, "pending", "currency");
  }
}

async function saveDueDate(page: PageHandler) {
  log.trace("AccountDetailsWriter: saving due date");
  const api = await GetCreditDetailsApi();
  const { data: dueDate } = await api.currentDueDate(await page.getImage());
  await page.pushValueEvent<VisaBalanceResult>(dueDate, "dueDate", "date");
}

async function saveDueAmount(page: PageHandler) {
  log.trace("AccountDetailsWriter: saving due amount");
  const api = await GetCreditDetailsApi();
  const { data: dueAmount } = await api.currentDueAmount(await page.getImage());
  await page.pushValueEvent<VisaBalanceResult>(dueAmount, "dueAmount", "currency");
}
