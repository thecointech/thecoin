
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import { HarvestConfig, DaysArray, HarvestStepType, HarvestArgs, addStep, removeStep } from '../../types';
import { defaultDays, defaultTime, defaultSteps } from '@thecointech/store-harvester';
import { IActions } from './types';
import { log } from '@thecointech/logging';

export const CONFIG_KEY = "config";

log.info("Loading config");
// The initial state of the App
const stored = await window.scraper.getHarvestConfig();
if (stored.error) {
  log.error({error: stored.error}, "Error loading config: {error}")
  alert("Error loading config: " + stored.error)
}
export const initialState: HarvestConfig = {
  schedule: stored.value?.schedule ?? {
    daysToRun: defaultDays,
    timeToRun: defaultTime,
  },
  steps: stored.value?.steps?.length ? stored.value.steps : defaultSteps,
}

export class ConfigReducer extends BaseReducer<IActions, HarvestConfig>(CONFIG_KEY, initialState)
  implements IActions {
  setDaysToRun(daysToRun: DaysArray): void {
    this.draftState.schedule = {
      ...this.state.schedule,
      daysToRun
    };
  }
  setTimeToRun(time: string): void {
    this.draftState.schedule = {
      ...this.state.schedule,
      timeToRun: time
    }
  }
  setStep(type: HarvestStepType, args?: HarvestArgs): void {
    this.draftState.steps = addStep({type, args}, this.state.steps);
  }
  clearStep(type: HarvestStepType): void {
    this.draftState.steps = removeStep(type, this.state.steps)
  }

  resetToDefault(): void {
    this.draftState = {
      schedule: {
        daysToRun: defaultDays,
        timeToRun: defaultTime,
      },
      steps: defaultSteps,
    };
  }
}
