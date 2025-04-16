import { GetAccountSummaryApi, GetBaseApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { accountToElementResponse, responseToElement } from "../vqaResponse";
import { ElementData, FoundElement } from "@thecointech/scraper/types";
import { AccountResponse, BBox } from "@thecointech/vqa";
import { extractFuzzyMatch } from "../extractFuzzyMatch";
import { PageHandler } from "../pageHandler";
import { processorFn } from "./types";
import { ChequeBalanceResult } from "../types";

export const AccountsSummary = processorFn("AccountsSummary", async (page: PageHandler) => {
  // Currently, we don't actually do anything, just list the accounts and move on...
  return await listAccounts(page);
})

async function listAccounts(page: PageHandler) {
  const api = GetAccountSummaryApi();
  // Get a list of all accounts
  const { data: accounts } = await api.listAccounts(await page.getImage());
  page.onProgress(25);
  page.logJson("AccountsSummary", "list-accounts-vqa", accounts);
  log.trace(`Found ${accounts.accounts.length} accounts`);
  // Click on each account
  const allAccounts: ElementData[] = [];
  for (const account of accounts.accounts) {

    log.trace(`Processing account: ${account.account_number} - ${account.account_type} - ${account.balance}`);
    // Find the most likely element describing this account
    const found = await responseToElement(page.page, accountToElementResponse(account));
    page.onProgress(25 + (50 * allAccounts.length / accounts.accounts.length));

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
  page.logJson("AccountsSummary", "list-accounts-elm", allAccounts);

  // Update inferred with the real account numbers, then save balance/navigation
  let r: { account: AccountResponse, nav: FoundElement }[] = [];
  for (let i = 0; i < accounts.accounts.length; i++) {
    // Just use the first account (maybe later we'll store them all)
    const inferred = accounts.accounts[i];
    const scraped = allAccounts[i];
    const accountNumber = await updateAccountNumber(inferred, scraped);

    // Crop to just the area of the account in the list.  This is because
    // VQA needs a bit of help focusing on the account
    const viewport = page.page.viewport();
    const crop = getCropFromElements([scraped], viewport);
    // Validate we can find the balance, as that is all some accounts need

    if (inferred.account_type == "Chequing") {
      await saveBalanceElement(page, accountNumber, crop);
    }

    // Validate we can navigate (in case we need more)
    const nav = await saveAccountNavigation(page, inferred);
    if (nav) {
      r.push({
        account: inferred,
        nav
      });
    }
    page.onProgress(75 + (25 * r.length / accounts.accounts.length));
  }
  return r;
}

async function saveBalanceElement(page: PageHandler, account_number: string, crop: BBox) {
  // Don't search the whole page, just the area around the account listing
  const { data: balance } = await GetAccountSummaryApi().accountBalanceElement(account_number, await page.getImage(), crop.top, crop.bottom);
  await page.pushValueEvent<ChequeBalanceResult>(balance, "balance", "currency");
  // return await page.toElement(balance, "balance", undefined, undefined);
}

async function saveAccountNavigation(page: PageHandler, account: AccountResponse) {
  const { data: nav } = await GetAccountSummaryApi().accountNavigateElement(account.account_number, await page.getImage());
  const asResponse = {
    ...nav,
    content: `${account.account_name} ${account.account_number}`,
    neighbour_text: account.account_type
  }
  return await page.toElement(asResponse, `navigate-${account.account_type}`, "a", undefined);
}


export async function updateAccountNumber(inferred: AccountResponse, scraped: ElementData) {
  const inferredAccountNumber = inferred.account_number;
  const realAccountText = scraped.text;
  // The inferred number may be off by a few digits
  const { data: corrected } = await GetBaseApi().correctEstimate(inferredAccountNumber, realAccountText, "account number");
  // This should be closer, but even it can be slightly off.  However
  // we should be close enough that a simple fuzzy-match will capture the correct value
  const { match: accountNumber } = extractFuzzyMatch(corrected.correct_value, realAccountText);
  // Update original
  log.trace(`Updating account number from inferred: (${inferredAccountNumber}) to (${accountNumber})`);
  inferred.account_number = accountNumber;
  return accountNumber;
}

// type Crop = [left: number, top: number, right: number, bottom: number];
// Processing the larger screenshot can result in errors reading small text.
// This function will focus in on the area containing the elements (vertically only)
function getCropFromElements(elements: ElementData[], viewport: { width: number, height: number } | null, buffer = 200) {
  const all_posY = elements.map(el => el.coords.centerY);
  const max_posY = Math.round(Math.max(...all_posY));
  const min_posY = Math.round(Math.min(...all_posY));
  return {
    left: 0,
    top: Math.max(max_posY - buffer, 0),
    right: viewport?.width ?? Number.MAX_SAFE_INTEGER,
    bottom: Math.min(min_posY + buffer, viewport?.height ?? Number.MAX_SAFE_INTEGER)
  };
}
