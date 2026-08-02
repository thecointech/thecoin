import type { IReplayCallbacks, ReplayErrorParams, ScraperProgress } from "@thecointech/scraper";
import { type CallbackOptions, TaskSessionBase } from "../taskSessionBase";
import type { EventSection } from "@thecointech/scraper-agent/types";
import { log } from "@thecointech/logging";
import { getErrorMessage } from "@/BackgroundTask";
import { replayErrorHandling } from "./errorHandling";


export class HarvesterReplayCallbacks extends TaskSessionBase implements IReplayCallbacks {

  events: EventSection|undefined;
  currentSubTask: string|undefined;
  lastErrorSection: string|undefined;

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
      // Clear the last error section when we reach 100% for a step
      if (stepPercent >= 100) {
        this.lastErrorSection = undefined;
      }

      this.subTaskCallback?.({
        subTaskId: this.currentSubTask,
        description: progress.stage,
        percent: totalPercent,
      })
    }
    return true;
  }

  async onError(params: ReplayErrorParams) {

    this.lastErrorSection = params.event.section;
    log.error(params.err, "Error in replay: " + params.event.section);
    if (!this.events) {
      log.error("No events set, nothing to handle");
      await this.dumpError(params.replay.page, params.err);
      return undefined;
    }

    const handled = await replayErrorHandling(params, this.events);
    if (handled === undefined) {
      // We failed to handle the error
      if (this.currentSubTask) {
        this.subTaskCallback?.({
          subTaskId: this.currentSubTask,
          completed: true,
          error: getErrorMessage(params.err),
        })
      }
      await this.dumpError(params.replay.page, params.err);
    }
    return handled;
  }

}
