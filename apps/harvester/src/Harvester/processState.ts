import type { HarvestData, ProcessingStage, UserData } from './types';

export async function processState(stages: ProcessingStage[], state: HarvestData, user: UserData) {
  let nextState = state;
  for (const stage of stages) {
    const delta = await stage.process(nextState, user);

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
