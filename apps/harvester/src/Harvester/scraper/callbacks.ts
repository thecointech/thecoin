import { log } from "@thecointech/logging";
import { Page } from "puppeteer";
import { rootFolder } from "@/paths";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { DateTime } from "luxon";
import { IScraperCallbacks, ScraperProgress } from "@thecointech/scraper";
import { AnyEvent } from "@thecointech/scraper/types";
import { BackgroundTaskCallback } from "@/BackgroundTask";
import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify } from "../notify";

export class ScraperCallbacks implements IScraperCallbacks {

  counter = 0;
  sessionId = DateTime.now().toSQL()!;
  private uiCallback?: BackgroundTaskCallback;
  private actionName: string;
  get logsFolder() {
    return path.join(rootFolder, "logs", this.sessionId.replaceAll(":", "-"));
  }

  constructor(actionName: string, uiCallback?: BackgroundTaskCallback) {
    this.actionName = actionName;
    this.uiCallback = uiCallback;
    mkdirSync(this.logsFolder, { recursive: true })
  }

  async onError(page: Page, error: unknown, _event?: AnyEvent) {
    log.error(error, "Error in replay");
    const didClose = await maybeCloseModal(page);
    if (didClose) {
      // Validation - does this work on live runs?
      // TODO: Remove once confident
      if (process.env.NOTIFY_ON_MODAL_ENCOUNTER) {
        notify({
          title: 'Modal Successfully Closed',
          message: "Closed Modal on page: " + page.url(),
        })
      }
    }
    else {
      await this.dumpPage(page);
    }
    return didClose;
  }


  async onProgress(progress: ScraperProgress) {
    const stepPercent = progress.stepPercent ?? 0;
    const totalPercent = stepPercent + ((progress.step * 100) / progress.total);
    this.uiCallback?.({
      taskId: "agent",
      stepId: this.actionName,
      progress: totalPercent,
      // Label probably should be defined client-side?
      label: `Step ${progress.step + 1} of ${progress.total}`,
    })
  }
  async complete(success: boolean, error?: string) {
    this.uiCallback?.({
      taskId: "agent",
      stepId: this.actionName,
      label: `Completed`,
      completed: success,
      error,
    })
  }

  async onScreenshot(intent: string, screenshot: Buffer | Uint8Array, _page: Page) {
    const outScFile = path.join(this.logsFolder, `${++this.counter}-${intent}.png`);
    writeFileSync(outScFile, screenshot, { encoding: "binary" });
  }


  logJson(intent: string, name: string, _data: any): void {
    log.info(`[${intent}] ${name}`);
    writeFileSync(
      path.join(this.logsFolder, `${this.counter}-${name}.json`),
      JSON.stringify(_data, null, 2)
    );
  }

  async dumpPage(page: Page) {
    const dumpFolder = path.join(this.logsFolder, "error");
    mkdirSync(dumpFolder, { recursive: true });
    try {
      await page.screenshot({ path: path.join(dumpFolder, "error.png"), type: "png" });
      // Save content might be helpful
      const content = await page.content();
      writeFileSync(path.join(dumpFolder, `error.html`), content);
      // Lastly, try for MHTML
      const cdp = await page.createCDPSession();
      const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
      writeFileSync(path.join(dumpFolder, `error.mhtml`), data);
    }
    catch (e) {
      log.error(e, `Error taking screenshot for error`);
    }
  }
}
