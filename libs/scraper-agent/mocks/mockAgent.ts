import type { Agent as AgentClass } from "../src/agent";
import type { EventManager } from "../src/eventManager";
import type { PageHandler } from "../src/pageHandler";
import type { NamedProcessor } from "../src/processors";
import { SectionType, sections } from "../src/processors/types";
import type { IAskUser, SectionName, EventSection, IAgentCallbacks } from "../src/types";
import { sleep } from "@thecointech/async/sleep";
import { AccountResponse } from "@thecointech/vqa";

export class Agent implements AgentClass {
  name: string;
  input: IAskUser;
  callbacks?: IAgentCallbacks | undefined;
  // Unused properties
  events!: EventManager;
  page!: PageHandler;

  constructor(name: string, input: IAskUser, callbacks?: IAgentCallbacks | undefined) {
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
    await mockGetting2faCode(this.input);
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
    let accounts = await this.processAccounts(sectionsToSkip);
    return {
      events: this.mockEventsResponse(sectionsToProcess),
      accounts,
    }
  }

  async processAccounts(sectionsToSkip?: SectionName[]) {
    if (!sectionsToSkip?.includes("AccountsSummary")) {
      return this.mockAccountResponse();
    }
    return [];
  }

  static create(name: string, input: IAskUser, _url: string, callbacks?: IAgentCallbacks | undefined) {
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


  mockAccountResponse(): AccountResponse[] {
    return [
      {
        account_type: "Chequing" as const,
        account_name: `${this.name} Chequing`,
        account_number: "123456789",
        balance: "100",
        position_x: 0,
        position_y: 0,
      },
      {
        account_type: "Credit" as const,
        account_name: `${this.name} Credit`,
        account_number: "4111 11** **** **11",
        balance: "100",
        position_x: 0,
        position_y: 0,
      },
      {
        account_type: "Credit" as const,
        account_name: `${this.name} Other Credit`,
        account_number: "4111 1111 1111 1111",
        balance: "100",
        position_x: 0,
        position_y: 0,
      }
    ];
  }

  mockEventsResponse(sectionsToProcess: SectionName[]): EventSection {
    return {
      section: "Initial",
      events: sectionsToProcess
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

// Allow overriding to force select or not
// (this is to compensate for not getting
// around to setting up Storybook here)
let overrideSelect: boolean | undefined = undefined;
async function mockGetting2faCode(input: IAskUser) {
  // 1 out of 3 times, pretend we have to select a destinations
  let doSelect = (overrideSelect ?? Math.random() < 1/3);
  if (doSelect) {
    await input.selectOption("Select where to send your 2FA code", [
      { name: "Phone", options: ["(123) 456-7890", "(098) 765-4321"] },
      { name: "Email", options: ["mocked_user@example.com", "mocked_user2@example.com"] },
    ]);
  }
  const code = await input.forValue("Enter your 2FA Code");
  return code;
}

