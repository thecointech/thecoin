import type { IScraperCallbacks } from "@thecointech/scraper";
import type { Agent as AgentClass } from "../src/agent";
import type { EventManager } from "../src/eventManager";
import type { PageHandler } from "../src/pageHandler";
import type { NamedProcessor } from "../src/processors";
import type { SectionType } from "../src/processors/types";
import type { IAskUser, SectionName, EventSection } from "../src/types";
import { sleep } from "@thecointech/async/sleep";

export class Agent implements AgentClass {
  name: string;
  events: EventManager;
  page: PageHandler;
  input: IAskUser;
  callbacks?: IScraperCallbacks | undefined;

  async process(_sectionsToSkip?: SectionName[]): Promise<EventSection> {
    for (let i = 0; i < 7; i++) {
      await sleep(1000);
    }
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
    };
  }

  static create() {
    return new Agent();
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
}
