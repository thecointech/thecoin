
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import { HarvestConfig, defaultDays, DaysArray, HarvestStep, HarvestStepType } from '../../types';
import { IActions } from './types';

export const CONFIG_KEY = "config";

// The initial state of the App
const stored = await window.scraper.getHarvestConfig();
export const initialState: HarvestConfig = stored.value ?? {
  daysToRun: defaultDays,
  steps: [
    { name: 'readVisaOwing' },
    {
      name: 'roundUp',
      args: {
        roundPoint: 100,
      },
    },
    null,
    null,
    {
      name: 'transferLimit',
      args: {
        limit: 200,
      },
    },
    { name: 'sendETransfer' },
    { name: 'payVisa' },
  ]
};

export class ConfigReducer extends BaseReducer<IActions, HarvestConfig>(CONFIG_KEY, initialState)
  implements IActions {
  setDaysToRun(daysToRun: DaysArray): void {
    this.draftState.daysToRun = daysToRun;
  }
  setStep(index: HarvestStepType, step: HarvestStep|null): void {
    this.draftState.steps = [
      ...this.state.steps.slice(0, index),
      step,
      ...this.state.steps.slice(index + 1),
    ]
  }
}
