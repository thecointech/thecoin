// import { BaseReducer } from "@thecointech/shared/store/immerReducer";
// import type { ProgressInfo } from "@thecointech/scraper-agent";
// import { ActionTypes } from "../Harvester/scraper";

// const AGENTPROGRESS_KEY = "agentProgress";

// //
// export interface IActions {
//   startAgent(action: ActionTypes, url: string): void;
//   setAgentProgress(state: AgentProgressState|undefined): void;
// }

// type AgentProgressState = ProgressInfo | {
//   completed: boolean
// } | {
//   error: string
// }

// const initialState = {
//   completed: undefined as boolean|undefined,
//   error: undefined as string|undefined,
//   progress: undefined as ProgressInfo|undefined,
// }

// export class AgentProgressReducer extends BaseReducer<IActions, typeof initialState>(AGENTPROGRESS_KEY, initialState)
//   implements IActions {

//   startAgent(action: ActionTypes, url: string): void {
//     this.draftState.completed = false;
//     this.draftState.error = undefined;
//     this.draftState.progress = undefined;
//     // No need to await this call
//     window.scraper.autoProcess(action, url);
//   }

//   setAgentProgress(state: AgentProgressState): void {
//     if (!state) {
//       this.draftState.completed = undefined;
//       this.draftState.error = undefined;
//       this.draftState.progress = undefined;
//     }
//     else if ("completed" in state) {
//       this.draftState.completed = true;
//       this.draftState.progress = undefined;
//     }
//     else if ("error" in state) {
//       this.draftState.completed = false;
//       this.draftState.error = state.error;
//       this.draftState.progress = undefined;
//     }
//     else {
//       this.draftState.progress = state;
//     }
//   }
// }
