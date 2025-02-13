import { IAgentLogger, IAskUser, SectionName } from './types';
import { log } from '@thecointech/logging';
import { PageHandler } from './pageHandler';

import { ProgressCallback, ProgressReporter } from './progressReporting';
import { AccountsSummary, CookieBanner, CreditAccountDetails, Landing, Login, NamedProcessor, TwoFA, SendETransfer } from './processors';
import { sections } from './processors/types';

export class Agent {

  static async process(name: string, bankUrl: string, input: IAskUser, logger: IAgentLogger, onProgress?: ProgressCallback, sectionsToSkip: SectionName[] = []) {

    log.info(`Processing ${name}`);

    const reporter = new ProgressReporter(onProgress);

    await using page = await PageHandler.create(name, bankUrl, logger);

    // First, clear out cookie banner
    await processSection(CookieBanner, reporter, page);

    let pageIntent = await page.getPageIntent();
    if (pageIntent == "Landing") {
      await processSection(Landing, reporter, page);
      pageIntent = await page.getPageIntent();
    }

    if (pageIntent != "Login") {
      await page.maybeThrow(new Error("Failed to get to Login"))
    }

    // Next, test a successful login
    const loginOutcome = await processSection(Login, reporter, page, input);
    switch(loginOutcome) {
      case "LoginError":
        await page.maybeThrow(new Error("Failed to login"))
        break;
      case "TwoFactorAuth":
        await processSection(TwoFA, reporter, page, input);
        break;
      default:
    }

    // Next intent should be "AccountsSummary"
    pageIntent = await page.getPageIntent();
    if (pageIntent != "AccountsSummary") {
      log.error({ intent: pageIntent }, `Expected to be on AccountsSummary, got {intent}.`);
      await page.maybeThrow(new Error("Failed to get to AccountsSummary"))
    }

    const accounts = await processSection(AccountsSummary, reporter, page);
    for (const account of accounts) {
      if (account.account.account_type == "Credit") {
        if (sectionsToSkip.includes("CreditAccountDetails")) continue;
        await processSection(CreditAccountDetails, reporter, page, account.nav.data);
      }
      else if (account.account.account_type == "Chequing") {
        if (sectionsToSkip.includes("SendETransfer")) continue;
        await processSection(SendETransfer, reporter, page, input, account.account.account_number);
      }
    }

    log.info(`Finished ${name}`);
    return page.allEvents;
  }
}

async function processSection<Args extends any[], R>(
  processor: NamedProcessor<Args, R>,
  reporter: ProgressReporter,
  page: PageHandler,
  ...args: Args
): Promise<R> {

  log.debug(`Processing section: ${processor.processorName}`);

  // Notify we are starting a new section
  reporter.currentSection = sections.indexOf(processor.processorName) + 1;
  reporter.sectionReporter(0);

  await using section = processor.isolated
    ? await page.pushIsolatedSection(processor.processorName)
    : page.pushSection(processor.processorName);
  try {
    return await processor(page, reporter.sectionReporter, ...args);
  }
  catch (e) {
    section.cancel();
    await page.maybeThrow(e)
    // If we got here, we possibly handled the error, let's try again
    return await processSection(processor, reporter, page, ...args);
  }
}
