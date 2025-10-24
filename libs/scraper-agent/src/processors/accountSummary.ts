import { log } from "@thecointech/logging";
import { accountToElementResponse } from "../vqaResponse";
import { ElementData, FoundElement } from "@thecointech/scraper/types";
import { AccountResponse, BBox } from "@thecointech/vqa";
import { extractFuzzyMatch } from "../extractFuzzyMatch";
import { processorFn } from "./types";
import { ChequeBalanceResult } from "../types";
import { Agent } from "../agent";
import { apis } from "../apis";

export const AccountsSummary = processorFn("AccountsSummary", async (agent: Agent) => {
  // Currently, we don't actually do anything, just list the accounts and move on...
  return await listAccounts(agent);
})

async function listAccounts(agent: Agent) {
  const api = await apis().getAccountSummaryApi();
  const { data: accounts } = await api.listAccounts(await agent.page.getImage());
  agent.onProgress(25);
  log.trace(`Found ${accounts.accounts.length} accounts`);
  // Get a list of all accounts
  const allAccounts = await findAccountElements(agent, accounts.accounts);

  // Update inferred with the real account numbers, then save balance/navigation
  let r: { account: AccountResponse, nav: FoundElement }[] = [];
  for (let i = 0; i < accounts.accounts.length; i++) {
    // Just use the first account (maybe later we'll store them all)
    const inferred = accounts.accounts[i];
    const scraped = allAccounts[i];
    const accountNumber = validateAccountNumberAgainstSource(inferred.account_number, scraped);
    inferred.account_number = accountNumber;

    // Crop to just the area of the account in the list.  This is because
    // VQA needs a bit of help focusing on the account
    const viewport = agent.page.page.viewport();
    const crop = getCropFromElements([scraped], viewport);
    // Validate we can find the balance, as that is all some accounts need

    if (inferred.account_type == "Chequing") {
      await saveBalanceElement(agent, accountNumber, crop);
    }

    // Validate we can navigate (in case we need more)
    const nav = await saveAccountNavigation(agent, inferred);
    if (nav) {
      r.push({
        account: inferred,
        nav
      });
    }
    agent.onProgress(75 + (25 * r.length / accounts.accounts.length));
  }
  return r;
}

export async function findAccountElements(agent: Agent, accounts: AccountResponse[]) {
  // Click on each account
  const allAccounts: ElementData[] = [];
  for (const account of accounts) {

    log.trace(`Processing account: ${account.account_number} - ${account.account_type} - ${account.balance}`);
    // Find the most likely element describing this account
    const found = await agent.page.toElement(accountToElementResponse(account), "account");
    agent.onProgress(25 + (50 * allAccounts.length / accounts.length));

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
  return allAccounts;
}

export async function saveBalanceElement(agent: Agent, account_number: string, crop: BBox) {
  // Don't search the whole page, just the area around the account listing
  const api = await apis().getAccountSummaryApi();
  const { data: balance } = await api.accountBalanceElement(account_number, await agent.page.getImage(), crop.top, crop.bottom);
  const element = await agent.page.toElement(balance, {
    eventName: "balance",
    parsing: {
      type: "currency",
      format: null,
    }
  });
  await agent.events.pushValueEvent<ChequeBalanceResult>(element, "balance", "currency");
}

export async function saveAccountNavigation(agent: Agent, account: AccountResponse) {
  const api = await apis().getAccountSummaryApi();
  const { data: nav } = await api.accountNavigateElement(account.account_number, await agent.page.getImage());
  const asResponse = {
    ...nav,
    content: `${account.account_name} ${account.account_number}`,
    neighbour_text: account.account_type
  }
  return await agent.page.toElement(asResponse, { eventName: "navigate-" + account.account_type, tagName: "a" });
}


export function validateAccountNumberAgainstSource(inferredAccountNumber: string, scraped: ElementData) {
  const realAccountText = scraped.text;
  // The inferred number may be off by a few digits, however
  // we should be close enough that a token-based match will capture the correct value with proper formatting
  const { match: accountNumber } = extractFuzzyMatch(inferredAccountNumber, realAccountText);
  // Update original
  log.trace(`Updating account number from inferred: (${inferredAccountNumber}) to (${accountNumber})`);
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
