import type { HarvestData, ProcessingStage } from './types';

export async function processState(stages: ProcessingStage[], state: HarvestData) {
  let nextState = state;
  for (const stage of stages) {
    const delta = await stage.process(nextState);

    const stepData = nextState.state.stepData || delta.stepData
    ? {
        ...nextState.state.stepData,
        ...delta.stepData
      }
      : undefined;

    nextState = {
      ...nextState,
      delta: [
        ...nextState.delta,
        delta,
      ],
      state: {
        ...nextState.state,
        ...delta,
        stepData,
      }
    }
  }
  return nextState;
}
