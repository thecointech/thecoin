import { log } from "@thecointech/logging";
import type { Page } from "puppeteer";
import { rootFolder } from "@/paths";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { DateTime } from "luxon";
import type { IScraperCallbacks, ScraperProgress } from "@thecointech/scraper";
import type { AnyEvent } from "@thecointech/scraper-types";
import { BackgroundTaskType, BackgroundTaskCallback, SubTaskProgress, getErrorMessage } from "@/BackgroundTask";
import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify } from "../notify";
import crypto from "node:crypto";
import type { EventSection } from "@thecointech/scraper-agent/types";

export type CallbackOptions = {
  taskType: BackgroundTaskType;
  uiCallback?: BackgroundTaskCallback;
  sections?: string[];
  timestamp?: number;
};

export class ScraperCallbacks implements IScraperCallbacks {

  counter = 0;
  timestamp: number;
  id = crypto.randomUUID();
  private taskType: BackgroundTaskType;
  // private actionType: string;
  private uiCallback?: BackgroundTaskCallback;
  get logsFolder() {
    const sessionId = DateTime.fromMillis(this.timestamp).toSQL()!.replaceAll(":", "-");
    return path.join(rootFolder, "logs", sessionId);
  }

  constructor(options: CallbackOptions) {
    // this.actionType = actionType;
    this.taskType = options.taskType;
    this.uiCallback = options.uiCallback;
    this.timestamp = options.timestamp ?? Date.now();
    mkdirSync(this.logsFolder, { recursive: true })

    // Call to initialize the task group
    if (this.uiCallback) {
      this.uiCallback({
        id: this.id,
        type: this.taskType,
      })
      // Initialize sub-tasks, this will give a
      // visual indication of how much progress has been made
      if (options.sections) {
        for (const section of options.sections)
          this.subTaskCallback({
            subTaskId: section,
          })
      }
    }
  }

  events: EventSection|undefined;
  currentSubTask: string|undefined;
  setSubTaskEvents(subTask: string, events: EventSection) {
    this.events = events;
    this.currentSubTask = subTask;
    this.subTaskCallback({
      subTaskId: subTask,
      description: subTask,
      percent: 0,
    })
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
      if (this.currentSubTask) {
        this.subTaskCallback?.({
          subTaskId: this.currentSubTask,
          completed: true,
          error: getErrorMessage(error),
        })
      }
      await this.dumpPage(page);
    }
    return didClose;
  }


  onProgress(progress: ScraperProgress) {
    const stepPercent = progress.stepPercent ?? 0;
    const totalPercent = stepPercent + ((progress.step) / progress.total);
    this.subTaskCallback?.({
      subTaskId: this.currentSubTask ?? progress.stage,
      description: progress.stage,
      percent: totalPercent,
    })
    // TODO: Allow cancellation
    return true;
  }

  subTaskCallback = (progress: SubTaskProgress) => {
    this.uiCallback?.({
      parentId: this.id,
      type: this.taskType,
      ...progress,
    })
  };

  async complete({ result, error }: { result?: string, error?: string }) {
    // Update TaskGroup
    const e = error ?? (!!result ? undefined : "Unknown error");
    this.uiCallback?.({
      id: this.id,
      type: this.taskType,
      completed: true,
      result,
      error: e,
    })
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
