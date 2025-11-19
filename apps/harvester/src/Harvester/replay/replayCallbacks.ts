import type { IReplayCallbacks, ReplayErrorParams, ScraperProgress } from "@thecointech/scraper";
import { type CallbackOptions, TaskSessionBase } from "../taskSessionBase";
import type { EventSection } from "@thecointech/scraper-agent/types";
import { log } from "@thecointech/logging";
import { replayErrorCallback } from "./replayErrorCallback";
import { getErrorMessage } from "@/BackgroundTask";


export class HarvesterReplayCallbacks extends TaskSessionBase implements IReplayCallbacks {

  events: EventSection|undefined;
  currentSubTask: string|undefined;

  constructor(options: CallbackOptions) {
    super(options, {
      writeScreenshotOnElement: true,
    });
  }

  setSubTaskEvents(subTask: string, events: EventSection) {
    this.events = events;
    this.currentSubTask = subTask;
    // Update the serializer output folder
    this.updateSerializerTarget(subTask);
    // Initialize the subtask in the UI
    this.subTaskCallback({
      subTaskId: subTask,
      description: subTask,
      percent: 0,
    })
  }

  onProgress(progress: ScraperProgress) {
    if (this.currentSubTask) {
      const stepPercent = progress.stepPercent ?? 0;
      const totalPercent = stepPercent + ((progress.step) / (progress.total || 1));
      this.subTaskCallback?.({
        subTaskId: this.currentSubTask,
        description: progress.stage,
        percent: totalPercent,
      })
    }
    return true;
  }

  async onError(params: ReplayErrorParams) {

    log.error(params.err, "Error in replay");
    if (!this.events) {
      log.error("No events set, nothing to handle");
      await this.dumpError(params.page, params.err);
      return undefined;
    }

    const handled = await replayErrorCallback(params, this.events);
    if (handled === undefined) {
      // We failed to handle the error
      if (this.currentSubTask) {
        this.subTaskCallback?.({
          subTaskId: this.currentSubTask,
          completed: true,
          error: getErrorMessage(params.err),
        })
      }
      await this.dumpError(params.page, params.err);
    }
    return handled;
  }

}
