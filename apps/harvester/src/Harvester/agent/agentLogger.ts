import { log } from "@thecointech/logging";
import type { IAgentLogger, SectionName } from "@thecointech/scraper-agent/types";
import { Page } from "puppeteer";
import { rootFolder } from "@/paths";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { DateTime } from "luxon";

export class AgentLogger implements IAgentLogger {

  counter = 0;
  sessionId = DateTime.now().toSQL()!;

  constructor() {
    mkdirSync(this.logsFolder(), { recursive: true })
  }

  logsFolder(){
    return path.join(rootFolder, "logs", this.sessionId.replaceAll(":", "-"));
  }

  logJson(intent: SectionName, name: string, _data: any): void {
    log.info(`[${intent}] ${name}`);
    writeFileSync(
      path.join(this.logsFolder(), `${this.counter}-${name}.json`),
      JSON.stringify(_data, null, 2)
    );
  }

  async logScreenshot(intent: SectionName, screenshot: Buffer | Uint8Array, _page: Page): Promise<void> {
    // Save screenshot
    const outScFile = path.join(this.logsFolder(), `${++this.counter}-${intent}.png`);
    writeFileSync(outScFile, screenshot, { encoding: "binary" });
  }
}
