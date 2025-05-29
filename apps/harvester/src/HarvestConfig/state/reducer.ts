
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import { HarvestConfig, defaultDays, DaysArray, HarvestStepType, HarvestArgs, addStep, removeStep, defaultTime, defaultSteps } from '../../types';
import { IActions } from './types';

export const CONFIG_KEY = "config";

// The initial state of the App
const stored = await window.scraper.getHarvestConfig();
export const initialState: HarvestConfig = {
  schedule: stored.value?.schedule ?? {
    daysToRun: defaultDays,
    timeToRun: defaultTime,
  },
  steps: stored.value?.steps ?? defaultSteps,
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
