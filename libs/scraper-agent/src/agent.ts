import type { IAgentCallbacks, IAskUser, ProcessAccount, ProcessResults, SectionName } from './types';
import { log } from '@thecointech/logging';
import { PageHandler } from './pageHandler';
import { closeBrowser } from '@thecointech/scraper';
import { AccountsSummary, CookieBanner, CreditAccountDetails, Landing, Login, type NamedProcessor, TwoFA, SendETransfer, Logout } from './processors';
import { EventManager } from './eventManager';
import { sections, type SectionType } from './processors/types';
import { apis } from './apis';

export class Agent implements AsyncDisposable {

  name: string;
  events: EventManager;
  page: PageHandler;
  input: IAskUser;
  callbacks?: IAgentCallbacks;

  get currentSection() {
    return this.events.currentSection.section;
  }

  private constructor(name: string, input: IAskUser, page: PageHandler, callbacks?: IAgentCallbacks) {
    this.name = name;
    this.events = new EventManager();
    this.page = page;
    this.input = input;
    this.callbacks = callbacks;

    this.page.recorder.onEvent(this.events.onEvent);
  }

  static async create(name: string, input: IAskUser, bankUrl?: string, callbacks?: IAgentCallbacks) {
    const page = await PageHandler.create(name);
    const agent = new Agent(name, input, page, callbacks);
    if (bankUrl) {
      // We start the process only once the recorder/agent is fully hooked up.
      await agent.page.recorder.goto(bankUrl);
    }
    return agent;
  }

  async [Symbol.asyncDispose]() {
    await this.page[Symbol.asyncDispose]();
    await closeBrowser();
  }

  async process(sectionsToSkip: SectionName[] = []) : Promise<ProcessResults> {

    log.info(`Processing ${this.name}`);

    // Verify VQA API is running
    await warmupVqaApi();

    // First, clear out cookie banner
    await this.processSection(CookieBanner);

    let pageIntent = await this.page.getPageIntent();
    if (pageIntent == "Landing") {
      await this.processSection(Landing);
      pageIntent = await this.page.getPageIntent();
    }

    if (pageIntent != "Login") {
      await this.maybeThrow(new Error("Failed to get to Login"))
    }

    // Next, test a successful login
    const loginOutcome = await this.processSection(Login);
    switch(loginOutcome) {
      case "TwoFactorAuth":
        await this.processSection(TwoFA);
        break;
      case "LoginSuccess":
        break;
      default:
        await this.maybeThrow(new Error("Failed to get to LoginSuccess"));
    }

    // Next intent should be "AccountsSummary"
    pageIntent = await this.page.getPageIntent();
    if (pageIntent != "AccountsSummary") {
      log.error({ intent: pageIntent }, `Expected to be on AccountsSummary, got {intent}.`);
      await this.maybeThrow(new Error("Failed to get to AccountsSummary"))
    }

    let accounts = await this.processAccounts(sectionsToSkip);

    // Once complete, logout politely
    if (!sectionsToSkip.includes("Logout")) {
      await this.processSection(Logout);
    }

    log.info(`Finished ${this.name}`);
    return {
      events: this.events.allEvents,
      accounts,
    }
  }

  async processAccounts(sectionsToSkip: SectionName[]) {
    if (!sectionsToSkip.includes("AccountsSummary")) {
      const accounts = await this.processSection(AccountsSummary);
      for (const account of accounts) {
        if (account.account.account_type == "Credit") {
          if (sectionsToSkip.includes("CreditAccountDetails")) continue;
          await this.processSection(CreditAccountDetails, account.nav.data);
        }
        else if (account.account.account_type == "Chequing") {
          if (sectionsToSkip.includes("SendETransfer")) continue;
          await this.processSection(SendETransfer, account.account.account_number);
        }
      }
      return accounts.map<ProcessAccount>(account => ({
        account_name: account.account.account_name,
        account_number: account.account.account_number,
        account_type: account.account.account_type,
        balance: account.account.balance,
      }));
    }
    return [];
  }


  async processSection<Args extends any[], R>(
    processor: NamedProcessor<Args, R>,
    ...args: Args
  ): Promise<R> {

    log.debug(`Processing section: ${processor.processorName}`);

    await using section = processor.isolated
      ? await this.pushIsolatedSection(processor.processorName)
      : this.events.pushSection(processor.processorName);
    try {
      this.onProgress(0);
      // Log intent at the start of each section
      // This could/should be used to validate progress
      const intent = await this.page.getPageIntent();
      log.debug(`With intent: ${intent}`);
      const r = await processor(this, ...args);
      this.onProgress(100);
      return r;
    }
    catch (e) {
      section.cancel();
      await this.maybeThrow(e)
      // If we got here, we possibly handled the error, let's try again
      return await this.processSection(processor, ...args);
    }
  }

  async pushIsolatedSection(subName: SectionType) {
    // First, get the clone:
    log.debug("Pushing isolated section: " + subName);
    const cloneTab = await this.page.tryCloneTab(subName);

    if (cloneTab) {
      // Connect clone to event manager
      cloneTab.sectionRecorder.onEvent(this.events.onEvent);
      this.events.pushPageFilter(cloneTab.sectionRecorder.page);
    }
    const cachedAgent = this;
    const events = this.events.pushSection(subName);
    return {
      section: events.section,
      cancel: () => events.cancel(),
      async [Symbol.asyncDispose]() {
        await events[Symbol.asyncDispose]();
        // Closing the tab can trigger events that we don't
        // care about, so pause the event manager for this
        using _ = cachedAgent.events.pause();
        await cloneTab?.[Symbol.asyncDispose]();
        if (cloneTab) {
          cachedAgent.events.popPageFilter();
        }
        log.info(`Isolated section ${subName} disposed`);
      }
    };
  }

  async maybeThrow(err: Error|unknown) {

    log.error(err, "Encoutered error, attempting to handle...");
    // Can we handle this error?
    // Right now, all we do is close modals,
    // but this could be extended to handle
    // a wide variety of issues.  It would probably
    // pay to have include what the agent was
    // doing and what we expected to happen when the
    // error occurred.

    // Do not record these actions (perhaps should have an error section instead?)
    using _ = this.events.pause();
    const wasHandled = await this.callbacks?.onError?.({
      page: this.page.page,
      err,
      section: this.currentSection,
    });

    log.info(` - Error handled: ${wasHandled}`);
    // if not, throw the original error
    if (!wasHandled) throw err;
  }

  onProgress(progress: number) {
    const currentName = this.currentSection;

    // get index of current section in Section enum
    const step = sections.indexOf(currentName as any);
    this.callbacks?.onProgress?.({
      step,
      stepPercent: progress,
      total: sections.length,
      stage: currentName
    });
  }
}

async function warmupVqaApi() {
  try {
    // test that the vqa api is warm
    const api = await apis().getVqaBaseApi();
    await api.warmup();
  }
  catch (e) {
    log.warn(e, "Failed to warm up VQA API");
    // If we can't warm up the VQA API, we can't continue
    throw e;
  }
  log.trace("VQA API warmed up");
}
