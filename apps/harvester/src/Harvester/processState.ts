import type { HarvestData, ProcessingStage } from './types';

export async function processState(stages: ProcessingStage[], state: HarvestData) {
  for (const stage of stages) {
    const delta = await stage.process(state);
    state.delta.push(delta);
    // Merge delta data into state
    const stepData = state.state.stepData || delta.stepData
      ? {
          ...state.state.stepData,
          ...delta.stepData
        }
        : undefined;
    state.state = {
      ...state.state,
      ...delta,
      stepData,
    };
  }
  return state;
}
