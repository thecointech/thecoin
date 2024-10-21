import { log } from '@thecointech/logging';
import type { HarvestData, HarvestDelta, ProcessingStage, UserData } from './types';

export async function processState(stages: ProcessingStage[], state: HarvestData, user: UserData) {
  let nextState = state;
  for (const stage of stages) {
    log.info(` ** Processing stage: ${stage.name}`);
    try {
      const delta = await stage.process(nextState, user);
      nextState = applyDeltaToState(nextState, delta);
    }
    catch (err) {

      log.error(err, `Error in step: ${stage.name}`);

      nextState = applyDeltaToState(nextState, {});
      nextState.errors ??= {};
      nextState.errors[stage.name] = (
        (err instanceof Error ? err.message : `${err}`)
      );

      // Continue processing - we can't tell what the problem is
      // but we shouldn't skip important later steps (eg. pay visa & heartbeat)
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

