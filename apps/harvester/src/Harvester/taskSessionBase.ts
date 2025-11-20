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

export class TaskSessionBase implements Disposable {

  counter = 0;
  timestamp: number;
  id = crypto.randomUUID();
  // Reporting progress to the UI
  private taskType: BackgroundTaskType;
  private uiCallback?: BackgroundTaskCallback;
  // Logging progress for analysis.
  private serializerOptions!: SerializerOptions;
  private _serializerPromise: Promise<AgentSerializer | null>;
  private serializer!: AgentSerializer | null;

  get logsFolder() {
    const sessionId = DateTime.fromMillis(this.timestamp).toSQL()!.replaceAll(":", "-");
    return path.join(rootFolder, "logs", sessionId);
  }

  protected constructor(options: CallbackOptions, serializerOptions?: Partial<SerializerOptions>) {
    this.taskType = options.taskType;
    this.uiCallback = options.uiCallback;
    this.timestamp = options.timestamp ?? Date.now();

    this.serializerOptions = {
      recordFolder: this.logsFolder,
      target: this.taskType,
      ...serializerOptions,
    };
    this._serializerPromise = maybeSerializeRun(this.serializerOptions);

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

  static async create<T extends new (...args: any[]) => TaskSessionBase>(
    this: T,
    ...args: ConstructorParameters<T>
  ): Promise<InstanceType<T>> {
    const r = new this(...args) as InstanceType<T>;
    await r.initSerializer();
    return r;
  }

  private async initSerializer() {
    this.serializer = await this._serializerPromise;
  }

  async [Symbol.dispose]() {
    this.serializer?.[Symbol.dispose]();
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
    await this.serializer?.dumpError(page, error);
  }
}
