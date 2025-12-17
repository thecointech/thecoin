import { DaysArray, HarvestArgs, HarvestStepType } from '../../types';

export interface IActions {
  setStep(type: HarvestStepType, args:HarvestArgs): void;
  clearStep(type: HarvestStepType): void;
  setDaysToRun(daysToRun: DaysArray): void;
  setTimeToRun(time: string): void;
  resetToDefault(): void;
}
