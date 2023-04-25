
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import { HarvestConfig, defaultDays, DaysArray, HarvestStepType, HarvestArgs } from '../../types';
import { IActions } from './types';

export const CONFIG_KEY = "config";

// The initial state of the App
const stored = await window.scraper.getHarvestConfig();
export const initialState: HarvestConfig = stored.value ?? {
  daysToRun: defaultDays,
  steps: [
    {
      type: HarvestStepType.TransferVisaOwing,
    },
    {
      type: HarvestStepType.RoundUp,
      args: {
        roundPoint: 100,
      },
    },
    null,
    null,
    {
      type: HarvestStepType.TransferLimit,
      args: {
        limit: 200,
      },
    },
    { type: HarvestStepType.SendETransfer },
    { type: HarvestStepType.PayVisa },
    // Heartbeat so we can be certain the harvester is alive when remote
    { type: HarvestStepType.Heartbeat },
  ]
};

export class ConfigReducer extends BaseReducer<IActions, HarvestConfig>(CONFIG_KEY, initialState)
  implements IActions {
  setDaysToRun(daysToRun: DaysArray): void {
    this.draftState.daysToRun = daysToRun;
  }
  setStep(type: HarvestStepType, args?: HarvestArgs): void {
    this.draftState.steps = [
      ...this.state.steps.slice(0, type),
      {
        type,
        args
      },
      ...this.state.steps.slice(type + 1),
    ]
  }
  clearStep(index: HarvestStepType): void {
    this.draftState.steps = [
      ...this.state.steps.slice(0, index),
      null,
      ...this.state.steps.slice(index + 1),
    ]
  }
}
