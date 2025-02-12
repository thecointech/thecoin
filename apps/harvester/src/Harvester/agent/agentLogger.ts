import { log } from "@thecointech/logging";
import { IAgentLogger, SectionName } from "@thecointech/scraper-agent/build/types";
import { Page } from "puppeteer";

export class AgentLogger implements IAgentLogger {
  logJson(intent: SectionName, name: string, data: any): void {
    log.info(`[${intent}] ${name}`);
  }
  async logScreenshot(intent: SectionName, screenshot: Buffer | Uint8Array, page: Page): Promise<void> {
    // TODO
  }

  private static __instance: AgentLogger;
  static get instance(): AgentLogger {
    if (!this.__instance) {
      this.__instance = new AgentLogger();
    }
    return this.__instance;
  }
}
