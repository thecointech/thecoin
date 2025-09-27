import type { BackgroundTaskInfo, BackgroundTaskType } from "./types";
import type { GroupAndSubTask, InitialState } from "./initialState";
import { isPresent } from "@thecointech/utilities";

export const getErrorMessage = (e: any) => {
  if (e?.message) {
    return e.message;
  }
  return String(e);
}

export function getTaskGroup(store: InitialState, type: BackgroundTaskType): GroupAndSubTask | undefined {
  // Always get the latest group
  return store.groups
    .filter(t => t.type === type)
    .sort((a, b) => a.timestamp - b.timestamp)
    .at(-1);
}

export function hasSubTasks(task?: BackgroundTaskInfo): task is GroupAndSubTask {
  return (task && 'subTasks' in task) ?? false;
}

export function isRunning(task?: BackgroundTaskInfo): boolean {
  return task && !task.completed || false;
}

export function isSuccess(task?: BackgroundTaskInfo): boolean|undefined {
  return task && !isRunning(task) && getErrors(task).length === 0;
}

export function getPercent(task: BackgroundTaskInfo): number {
  return task.percent ?? (isSuccess(task) ? 100 : 0);
}

export function getErrors(task?: BackgroundTaskInfo): string[] {
  const errors: string[] = [];
  if (task) {
    if (task.error) {
      errors.push(task.error);
    }
    if (hasSubTasks(task)) {
      // Collect erors from subtasks as well
      errors.push(...task.subTasks.map(getErrors).flat().filter(isPresent));
    }
  }
  return errors;
}

export function getCompleted(tasks: BackgroundTaskInfo[]): BackgroundTaskInfo[] {
  return tasks.filter(isRunning);
}

// export const getError = (task: BackgroundTaskInfo) => ("error" in task ? task.error : undefined);
// export const getProgress = (task: BackgroundTaskInfo) => ("progress" in task ? task.progress : "completed" in task ? 100 : 0);
