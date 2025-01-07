import { BaseReducer } from "@thecointech/shared/store/immerReducer";
import type { ReplayProgress } from "@thecointech/scraper/types";

const REPLAYPROGRESS_KEY = "replayProgress";

//
export interface IActions {
  setReplayProgress(state: ReplayProgress|undefined): void;
}

const initialState = {
  progress: undefined as ReplayProgress|undefined,
}

export class ReplayProgressReducer extends BaseReducer<IActions, typeof initialState>(REPLAYPROGRESS_KEY, initialState)
  implements IActions {
  setReplayProgress(state: ReplayProgress|undefined): void {
    this.draftState.progress = state
  }
}
