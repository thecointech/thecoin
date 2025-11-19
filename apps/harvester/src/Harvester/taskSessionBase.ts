import type { Page } from "puppeteer";
import { rootFolder } from "@/paths";
import path from "node:path";
import { DateTime } from "luxon";
import type { BackgroundTaskType, BackgroundTaskCallback, SubTaskProgress } from "@/BackgroundTask";
import crypto from "node:crypto";
import { AgentSerializer, SerializerOptions } from "@thecointech/scraper-agent/agentSerializer";
import { maybeSerializeRun } from "./scraperLogging";

export type CallbackOptions = {
  taskType: BackgroundTaskType;
  uiCallback?: BackgroundTaskCallback;
  sections?: string[];
  timestamp?: number;
};

export class TaskSessionBase implements AsyncDisposable {

  counter = 0;
  timestamp: number;
  id = crypto.randomUUID();
  // Reporting progress to the UI
  private taskType: BackgroundTaskType;
  private uiCallback?: BackgroundTaskCallback;
  // Logging progress for analysis.
  private serializerOptions: SerializerOptions;
  private serializer: Promise<AgentSerializer | null>;

  get logsFolder() {
    const sessionId = DateTime.fromMillis(this.timestamp).toSQL()!.replaceAll(":", "-");
    return path.join(rootFolder, "logs", sessionId);
  }

  constructor(options: CallbackOptions, serializerOptions?: Partial<SerializerOptions>) {
    this.taskType = options.taskType;
    this.uiCallback = options.uiCallback;
    this.timestamp = options.timestamp ?? Date.now();

    // Initialize the serializer
    this.serializerOptions = {
      recordFolder: this.logsFolder,
      target: this.taskType,
      ...serializerOptions,
    };
    this.serializer = maybeSerializeRun(this.serializerOptions);

    // Call to initialize the task group
    if (this.uiCallback) {
      this.uiCallback({
        id: this.id,
        type: this.taskType,
      })
      // Initialize sub-tasks, this will give a
      // visual indication of how much progress has been made
      if (options.sections) {
        for (const section of options.sections) {
          this.subTaskCallback({
            subTaskId: section,
            description: section,
            percent: 0,
          })
        }
      }
    }
  }

  async [Symbol.asyncDispose]() {
    const serializer = await this.serializer;
    serializer?.[Symbol.dispose]();
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

  updateSerializerTarget(target: string) {
    // This is very hacky, but it's the easiest
    // way to do this synchronously.  If the
    // serializer exists, it shares this object
    this.serializerOptions.target = target;
  }

  async dumpError(page: Page, error?: unknown) {
    const serializer = await this.serializer;
    serializer?.dumpError(page, error);
  }
}
