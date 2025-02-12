import { BaseReducer } from "@thecointech/shared/store/immerReducer";
import { BackgroundTaskInfo } from "./types";

const TASKPROGRESS_KEY = "taskProgress";

//
export interface IActions {
  setTaskProgress(state: BackgroundTaskInfo): void;
}


const initialState = {
  tasks: {} as Record<string, BackgroundTaskInfo>,
}

export class BackgroundTaskReducer extends BaseReducer<IActions, typeof initialState>(TASKPROGRESS_KEY, initialState)
  implements IActions {

  setTaskProgress(state: BackgroundTaskInfo): void {
    this.draftState.tasks[state.stepId] = state;
    if (state.progress === 100 && state.completed === undefined) {
      this.draftState.tasks[state.stepId].completed = state.error === undefined;
    }
  }
}
