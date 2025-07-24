import { IAskUser, SectionName } from './types';
import { log } from '@thecointech/logging';
import { PageHandler } from './pageHandler';
import { closeBrowser, IScraperCallbacks } from '@thecointech/scraper';
import { AccountsSummary, CookieBanner, CreditAccountDetails, Landing, Login, NamedProcessor, TwoFA, SendETransfer, Logout } from './processors';

export class Agent {

  static async process(name: string, bankUrl: string, input: IAskUser, callbacks?: IScraperCallbacks, sectionsToSkip: SectionName[] = []) {

    log.info(`Processing ${name}`);

    await using page = await PageHandler.create(name, bankUrl, callbacks);

    // First, clear out cookie banner
    await processSection(CookieBanner, page);

    let pageIntent = await page.getPageIntent();
    if (pageIntent == "Landing") {
      await processSection(Landing, page);
      pageIntent = await page.getPageIntent();
    }

    if (pageIntent != "Login") {
      await page.maybeThrow(new Error("Failed to get to Login"))
    }

    // Next, test a successful login
    const loginOutcome = await processSection(Login, page, input);
    switch(loginOutcome) {
      case "TwoFactorAuth":
        await processSection(TwoFA, page, input);
        break;
      case "LoginSuccess":
        break;
      default:
        await page.maybeThrow(new Error("Failed to get to LoginSuccess"));
    }

    // Next intent should be "AccountsSummary"
    pageIntent = await page.getPageIntent();
    if (pageIntent != "AccountsSummary") {
      log.error({ intent: pageIntent }, `Expected to be on AccountsSummary, got {intent}.`);
      await page.maybeThrow(new Error("Failed to get to AccountsSummary"))
    }

    if (!sectionsToSkip.includes("AccountsSummary")) {
      const accounts = await processSection(AccountsSummary, page);
      for (const account of accounts) {
        if (account.account.account_type == "Credit") {
          if (sectionsToSkip.includes("CreditAccountDetails")) continue;
          await processSection(CreditAccountDetails, page, account.nav.data);
        }
        else if (account.account.account_type == "Chequing") {
          if (sectionsToSkip.includes("SendETransfer")) continue;
          await processSection(SendETransfer, page, input, account.account.account_number);
        }
      }
    }

    // Once complete, logout politely
    if (!sectionsToSkip.includes("Logout")) {
      await processSection(Logout, page);
    }

    log.info(`Finished ${name}`);

    await closeBrowser();
    return page.allEvents;
  }
}

async function processSection<Args extends any[], R>(
  processor: NamedProcessor<Args, R>,
  page: PageHandler,
  ...args: Args
): Promise<R> {

  log.debug(`Processing section: ${processor.processorName}`);

  await using section = processor.isolated
    ? await page.pushIsolatedSection(processor.processorName)
    : page.pushSection(processor.processorName);
  try {
    page.onProgress(0);
    // Log intent at the start of each section
    // This could/should be used to validate progress
    const intent = await page.getPageIntent();
    log.debug(`With intent: ${intent}`);
    const r = await processor(page, ...args);
    page.onProgress(100);
    return r;
  }
  catch (e) {
    section.cancel();
    await page.maybeThrow(e)
    // If we got here, we possibly handled the error, let's try again
    return await processSection(processor, page, ...args);
  }
}
