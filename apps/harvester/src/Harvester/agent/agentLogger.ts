import { IAgentLogger, SectionName } from "@thecointech/scraper-agent/build/types";
import { Page } from "puppeteer";

export class AgentLogger implements IAgentLogger {
  logJson(intent: SectionName, name: string, data: any): void {
    // TODO
  }
  async logScreenshot(intent: SectionName, screenshot: Buffer | Uint8Array, page: Page): Promise<void> {
    // TODO
  }

  static get instance(): AgentLogger {
    throw new Error("Method not implemented.");
  }
}
