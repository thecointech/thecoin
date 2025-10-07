import type { IScraperCallbacks } from "@thecointech/scraper";
import type { Agent as AgentClass } from "../src/agent";
import type { EventManager } from "../src/eventManager";
import type { PageHandler } from "../src/pageHandler";
import type { NamedProcessor } from "../src/processors";
import { SectionType, sections } from "../src/processors/types";
import type { IAskUser, SectionName, EventSection } from "../src/types";
import { sleep } from "@thecointech/async/sleep";
import { AccountResponse } from "@thecointech/vqa";

export class Agent implements AgentClass {
  name: string;
  input: IAskUser;
  callbacks?: IScraperCallbacks | undefined;
  // Unused properties
  events!: EventManager;
  page!: PageHandler;

  constructor(name: string, input: IAskUser, callbacks?: IScraperCallbacks | undefined) {
    this.name = name;
    this.input = input;
    this.callbacks = callbacks;
  }

  async process(sectionsToSkip?: SectionName[]) {
    const sectionsToProcess = sections.filter(s => !sectionsToSkip?.includes(s));
    const pre2faStages = sectionsToProcess.slice(0, 3);
    for (const stage of pre2faStages) {
      await sleep(1000);
      this.callbacks?.onProgress?.({
        stage,
        stepPercent: 100,
        step: 1,
        total: 1,
      });
    }
    // mock getting 2fa code
    const code = await this.input.forValue("Get 2FA Code");
    const post2faStages = sectionsToProcess.slice(pre2faStages.length);
    for (const stage of post2faStages) {
      await sleep(1000);
      this.callbacks?.onProgress?.({
        stage,
        stepPercent: 100,
        step: 1,
        total: 1,
      });
    }
    return {
      events: this.mockEventsResponse(),
      accounts: this.mockAccountResponse(),
    }
  }

  async processAccounts() {
    return [];
  }

  static create(name: string, input: IAskUser, _url: string, callbacks?: IScraperCallbacks | undefined) {
    return new Agent(name, input, callbacks);
  }

  get currentSection(): SectionName {
    throw new Error("Method not implemented.");
  }
  processSection<Args extends any[], R>(processor: NamedProcessor<Args, R>, ...args: Args): Promise<R> {
    throw new Error("Method not implemented.");
  }
  pushIsolatedSection(subName: SectionType): Promise<{ section: EventSection; cancel: () => void;[Symbol.asyncDispose](): Promise<void>; }> {
    throw new Error("Method not implemented.");
  }
  maybeThrow(err: Error | unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onProgress(progress: number): void {
    throw new Error("Method not implemented.");
  }

  async [Symbol.asyncDispose]() {
    return;
  }


  mockAccountResponse(sectionsToSkip?: SectionName[]): AccountResponse[] {
    const r = [];
    if (!sectionsToSkip?.includes("SendETransfer")) {
      r.push({
        account_type: "Chequing" as const,
        account_name: `${this.name} Chequing`,
        account_number: "123456789",
        balance: "100",
        position_x: 0,
        position_y: 0,
      })
    }
    if (!sectionsToSkip?.includes("CreditAccountDetails")) {
      r.push({
        account_type: "Credit" as const,
        account_name: `${this.name} Credit`,
        account_number: "4111 11** **** **11",
        balance: "100",
        position_x: 0,
        position_y: 0,
      })
    }
    return r;
  }

  mockEventsResponse(): EventSection {
    return {
      section: "Initial",
      events: (["Login", "AccountsSummary", "CreditAccountDetails", "SendETransfer", "Logout"] as const)
        .map((s, i) => ({
          section: s,
          events: [
            // One mock event so replay can find has something to do
            {
              id: i.toString(),
              type: "navigation",
              timestamp: i,
              to: "https://www.example.com",
            }
          ]
        })
      )
    }
  }
}
