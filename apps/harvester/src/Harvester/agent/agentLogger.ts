import { log } from "@thecointech/logging";
import { IAgentLogger, SectionName } from "@thecointech/scraper-agent/build/types";
import { Page } from "puppeteer";
import { rootFolder } from "@/paths";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

export class AgentLogger implements IAgentLogger {

  counter = 0;

  logsFolder = path.join(rootFolder, "logs");
  constructor() {
    mkdirSync(this.logsFolder, { recursive: true })
  }

  logJson(intent: SectionName, name: string, _data: any): void {
    log.info(`[${intent}] ${name}`);
    writeFileSync(
      path.join(this.logsFolder, `${this.counter}-${name}.json`),
      JSON.stringify(_data, null, 2)
    );
  }

  async logScreenshot(intent: SectionName, screenshot: Buffer | Uint8Array, _page: Page): Promise<void> {
    // Save screenshot
    const outScFile = path.join(this.logsFolder, `${++this.counter}-${intent}.png`);
    writeFileSync(outScFile, screenshot, { encoding: "binary" });
  }

  private static __instance: AgentLogger;
  static get instance(): AgentLogger {
    if (!this.__instance) {
      this.__instance = new AgentLogger();
    }
    return this.__instance;
  }
}
