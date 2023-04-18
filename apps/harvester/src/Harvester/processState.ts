import type { HarvestData, ProcessingStage } from './types';

export async function processState(stages: ProcessingStage[], state: HarvestData, lastState?: HarvestData) {
  for (const stage of stages) {
    state = await stage.process(state, lastState);
  }
  return state;
}
