import { BaseReducer } from "@thecointech/shared/store/immerReducer";
import { BackgroundTaskInfo, BackgroundTaskType, isSubTask } from "./types";
import { GroupAndSubTask, initialState, InitialState } from "./initialState";
import { log } from "@thecointech/logging";
import { getPercent, getTaskGroup } from "./selectors";

const TASKPROGRESS_KEY = "taskProgress";

export interface IActions {
  setTaskProgress(state: BackgroundTaskInfo): void;
}

export class BackgroundTaskReducer extends BaseReducer<IActions, InitialState>(TASKPROGRESS_KEY, initialState)
  implements IActions {

  setTaskProgress(task: BackgroundTaskInfo): void {
    if (isSubTask(task)) {
      let groupIdx = this.draftState.groups.findIndex(g => g.id === task.parentId);
      if (groupIdx === -1) {
        // Create new group if not found
        groupIdx = this.draftState.groups.length;
        this.draftState.groups[groupIdx] = {
          timestamp: Date.now(),
          id: task.parentId,
          type: task.type,
          percent: 0,
          subTasks: [],
        };
      }

      // Compute 'running' status.  GroupTasks can be computed
      // because we don't know how many subtasks are operating, but
      // for subtasks that isn't a concern
      // if (task.running === undefined && task.percent && task.percent >= 100) {
      //   task.running = false;
      // }

      // Find or create subtask
      let existing = this.draftState.groups[groupIdx];
      const subTasks = existing.subTasks;
      const taskIdx = subTasks.findIndex(t => t.subTaskId === task.subTaskId);
      if (taskIdx === -1) {
        subTasks.push(task);
      } else {
        subTasks[taskIdx] = {
          ...subTasks[taskIdx],
          ...task,
        };
      }

      // Calculate group percent
      existing.percent = subTasks.reduce((a, t) => a + getPercent(t) / subTasks.length, 0)

      if (task.error) {
        log.error(`Task error: ${existing.type} - ${task.subTaskId}`, task.error);
      }
    }
    else {
      const groupIdx = this.draftState.groups.findIndex(g => g.id === task.id);
      if (groupIdx === -1) {
        log.info(`Task started: ${task.type} - ${task.id}`);
        this.draftState.groups.push({
          timestamp: Date.now(),
          ...task,
          subTasks: [],
        });
      } else {
        if (task.completed) {
          log.info(`Task completed: ${task.type} - ${task.id}`);
        }
        this.draftState.groups[groupIdx] = {
          ...this.state.groups[groupIdx],
          ...task,
        };
      }
    }
  }
}

export function useBackgroundTask(type: BackgroundTaskType): GroupAndSubTask | undefined {
  const store = BackgroundTaskReducer.useData();
  return getTaskGroup(store, type);
}


