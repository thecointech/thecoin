import { BaseReducer } from "@thecointech/shared/store/immerReducer";
import { BackgroundTaskType, BackgroundTaskInfo, GroupTask, SubTask, isSubTask } from "./types";
import { log } from "@thecointech/logging";

const TASKPROGRESS_KEY = "taskProgress";

type GroupAndSubTask = GroupTask & {
  subTasks: SubTask[]
};
type GroupTaskStore = GroupAndSubTask[];

export interface IActions {
  setTaskProgress(state: BackgroundTaskInfo): void;
}

const initialState = {
  groups: [] as GroupTaskStore,
}

export class BackgroundTaskReducer extends BaseReducer<IActions, typeof initialState>(TASKPROGRESS_KEY, initialState)
  implements IActions {

  setTaskProgress(task: BackgroundTaskInfo): void {
    if (isSubTask(task)) {
      let groupIdx = this.draftState.groups.findIndex(g => g.id === task.parentId);
      if (groupIdx === -1) {
        // Create new group if not found
        groupIdx = this.draftState.groups.length;
        this.draftState.groups[groupIdx] = {
          id: task.parentId,
          type: task.type,
          subTasks: [],
        };
      }

      // Compute 'completed' status.  GroupTasks can be computed
      // because we don't know how many subtasks are operating, but
      // for subtasks that isn't a concern
      if (task.completed === undefined && task.percent && task.percent >= 100) {
        task.completed = true;
      }

      // Find or create subtask
      let existing = this.draftState.groups[groupIdx];
      const taskIdx = existing.subTasks.findIndex(t => t.subTaskId === task.subTaskId);
      if (taskIdx === -1) {
        existing.subTasks.push(task);
      } else {
        existing.subTasks[taskIdx] = task;
      }

      // Calculate overall percent
      const subTasks = existing.subTasks;
      existing.percent = subTasks.length > 0
        ? subTasks.reduce((a, t) => a + (t.percent ?? (t.completed ? 100 : 0)), 0) / subTasks.length
        : 0;

      if (task.error) {
        log.error(`Task error: ${existing.type} - ${task.subTaskId}`, task.error);
      }
    }
    else {
      const groupIdx = this.draftState.groups.findIndex(g => g.id === task.id);
      if (groupIdx === -1) {
        log.info(`Task started: ${task.type} - ${task.id}`);
        this.draftState.groups.push({
          ...task,
          subTasks: [],
        });
      } else {
        this.draftState.groups[groupIdx] = {
          ...task,
          subTasks: this.draftState.groups[groupIdx].subTasks,
        };
      }
    }
  }
}

export function getTaskGroup(store: typeof initialState, type: BackgroundTaskType): GroupAndSubTask | undefined {
  // Always get the latest group
  return store.groups.filter(t => t.type === type).at(-1);
}

export function getRunning(tasks: BackgroundTaskInfo[]): BackgroundTaskInfo[] {
  return tasks.filter(t => t.completed === undefined);
}
export function getCompleted(tasks: BackgroundTaskInfo[]): BackgroundTaskInfo[] {
  return tasks.filter(t => t.completed !== undefined);
}
