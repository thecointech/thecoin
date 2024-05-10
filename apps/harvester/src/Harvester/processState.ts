import { log } from '@thecointech/logging';
import type { HarvestData, HarvestDelta, ProcessingStage, UserData } from './types';
import { setCurrentState } from './db';

export async function processState(stages: ProcessingStage[], state: HarvestData, user: UserData) {
  let nextState = state;
  for (const stage of stages) {
    log.info(` ** Processing stage: ${stage.name}`);
    try {
      const delta = await stage.process(nextState, user);
      nextState = applyDeltaToState(nextState, delta);  
    }
    catch (err) {

      log.error(`Failed to process ${stage.name} - saving state anyway`);
      // Something has blown up, but we may have already changed things - eg,
      // sent an e-transfer.  We need to ensure this is recorded.
      if (!process.env.HARVESTER_DRY_RUN) {
        await setCurrentState(nextState);
      }
      // But don't let anyone think we're still OK
      throw err;
    }
  }
  return nextState;
}

function applyDeltaToState(nextState: HarvestData, delta: HarvestDelta) {
  const stepData = nextState.state.stepData || delta.stepData
    ? {
      ...nextState.state.stepData,
      ...delta.stepData
    }
    : undefined;

  return {
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
  };
}

