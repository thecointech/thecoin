import { IAgentLogger, IAskUser } from './types';
import { log } from '@thecointech/logging';
import { NotAnETransferPageError } from './processors/sendETransfer';
import { PageHandler } from './pageHandler';

import { SectionType, SectionProcessors } from './processors';

export class AutoScripting {

  static async process(name: string, bankUrl: string, input: IAskUser, logger: IAgentLogger) {

    log.info(`Processing ${name}`);

    await using page = await PageHandler.create(name, bankUrl, logger);

    // if (clean) {
    //   // CIBC/BMO somehow seem to fail when opening the first time
    //   await triggerNavigateAndWait(page, () => page.reload({ waitUntil: "networkidle2" }));
    // }

    // First, clear out cookie banner
    await processSection("CookieBanner", page);

    let pageIntent = await page.getPageIntent();
    if (pageIntent == "Landing") {
      await processSection("Landing", page);
      pageIntent = await page.getPageIntent();
    }

    if (pageIntent != "Login") {
      throw new Error("Failed to get to Login");
    }

    // Next, test a successful login
    const loginOutcome = await processSection("Login", page, input);
    switch(loginOutcome) {
      case "LoginError":
        throw new Error("Failed to login");
      case "TwoFactorAuth":
        await processSection("TwoFA", page, input);
        break;
      default:
    }

    // Next intent should be "AccountsSummary"
    pageIntent = await page.getPageIntent();
    if (pageIntent != "AccountsSummary") {
      log.error({ intent: pageIntent }, `Expected to be on AccountsSummary, got {intent}.`);
      throw new Error("Failed to get to AccountsSummary");
    }

    const accounts = await processSection("AccountsSummary", page);
    for (const account of accounts) {
      if (account.account.account_type == "Credit") {
        await using creditSection = await page.pushIsolatedSection("CreditAccountDetails");
        await SectionProcessors.CreditAccountDetails(page, account.nav.data);
        creditSection.commit();
      }
      else if (account.account.account_type == "Chequing") {
        await trySendETransfer(page, input, account.account.account_number);
      }
    }

    log.info(`Finished ${name}`);
    return page.allEvents;
  }
}

async function processSection<
  T extends SectionType
>(
  section: T,
  page: PageHandler,
  ...args: Parameters<typeof SectionProcessors[T]> extends [PageHandler, ...infer Rest] ? Rest : never
): Promise<Awaited<ReturnType<typeof SectionProcessors[T]>>> {
  using _s = page.pushSection(section);
  const mergedArgs = [page, ...args];
  // @ts-ignore
  return await SectionProcessors[section](...mergedArgs);
}


async function trySendETransfer(page: PageHandler, input: IAskUser, accountNumber: string): Promise<boolean> {
  const attemptedLinks = new Set<string>();
  for (let i = 0; i < 5; i++) {
    try {
      await using eventSection = await page.pushIsolatedSection("SendETransfer");
      await SectionProcessors.SendETransfer(page, input, accountNumber, attemptedLinks);
      eventSection.commit();
      return true;
    }
    catch (e) {
      log.error(e);

      // If we couldn't find the link, the whole thing is busted
      // if (e instanceof CannotFindLinkError) {
      //   throw e;
      // }
      if (e instanceof NotAnETransferPageError) {
        // This could mean the original link was bad
        // Otherwise, we go back to the start and try again
        continue;
      }
      // Dunno, but probably best to give up
      throw e;
    }
  }
  return false;
}
